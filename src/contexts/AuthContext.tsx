import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Permission } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessCode: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'accessCode' | 'createdAt'> & { password: string }) => Promise<User>;
  updateUser: (id: string, user: Partial<User> & { password?: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  getNextAccessCode: () => Promise<string>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'cezar_session';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      // Fetch all users with their roles and permissions
      const { data: appUsers, error: usersError } = await supabase
        .from('app_users')
        .select('*')
        .order('access_code');

      if (usersError) throw usersError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const { data: permissions, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('*');

      if (permissionsError) throw permissionsError;

      // Combine data
      const combinedUsers: User[] = (appUsers || []).map((appUser) => {
        const userRole = roles?.find((r) => r.user_id === appUser.id);
        const userPermissions = permissions?.filter((p) => p.user_id === appUser.id) || [];

        return {
          id: appUser.id,
          accessCode: appUser.access_code,
          name: appUser.name,
          cpf: appUser.cpf,
          role: (userRole?.role || 'vendedor') as User['role'],
          permissions: userPermissions.map((p) => ({
            module: p.module,
            actions: p.actions || [],
          })),
          active: appUser.active ?? true,
          createdAt: new Date(appUser.created_at),
        };
      });

      setUsers(combinedUsers);
      return combinedUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const refreshUsers = async () => {
    await fetchUsers();
  };

  useEffect(() => {
    const initAuth = async () => {
      // Load users from database
      const loadedUsers = await fetchUsers();

      // Check for existing session
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        try {
          const sessionData = JSON.parse(session);
          const sessionUser = loadedUsers.find((u) => u.id === sessionData.id);
          if (sessionUser && sessionUser.active) {
            setUser(sessionUser);
          } else {
            localStorage.removeItem(SESSION_KEY);
          }
        } catch {
          localStorage.removeItem(SESSION_KEY);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (accessCode: string, password: string): Promise<boolean> => {
    try {
      // Find user by access code
      const { data: appUser, error: userError } = await supabase
        .from('app_users')
        .select('*')
        .eq('access_code', accessCode)
        .eq('active', true)
        .single();

      if (userError || !appUser) return false;

      // Verify password (simple comparison since we're storing plain text for now)
      if (appUser.password_hash !== password) return false;

      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', appUser.id)
        .single();

      // Get user permissions
      const { data: permissionsData } = await supabase
        .from('user_permissions')
        .select('module, actions')
        .eq('user_id', appUser.id);

      const fullUser: User = {
        id: appUser.id,
        accessCode: appUser.access_code,
        name: appUser.name,
        cpf: appUser.cpf,
        role: (roleData?.role || 'vendedor') as User['role'],
        permissions: (permissionsData || []).map((p) => ({
          module: p.module,
          actions: p.actions || [],
        })),
        active: appUser.active ?? true,
        createdAt: new Date(appUser.created_at),
      };

      setUser(fullUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ id: appUser.id }));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const getNextAccessCode = async (): Promise<string> => {
    try {
      const { data } = await supabase
        .from('app_users')
        .select('access_code')
        .order('access_code', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const maxCode = parseInt(data[0].access_code, 10);
        return String(maxCode + 1).padStart(3, '0');
      }
      return '001';
    } catch {
      return '001';
    }
  };

  const addUser = async (
    newUserData: Omit<User, 'id' | 'accessCode' | 'createdAt'> & { password: string }
  ): Promise<User> => {
    const accessCode = await getNextAccessCode();

    // Insert user
    const { data: insertedUser, error: insertError } = await supabase
      .from('app_users')
      .insert({
        access_code: accessCode,
        name: newUserData.name,
        cpf: newUserData.cpf,
        password_hash: newUserData.password,
        active: newUserData.active,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Insert role
    await supabase.from('user_roles').insert({
      user_id: insertedUser.id,
      role: newUserData.role,
    });

    // Insert permissions
    for (const perm of newUserData.permissions) {
      await supabase.from('user_permissions').insert({
        user_id: insertedUser.id,
        module: perm.module,
        actions: perm.actions,
      });
    }

    const newUser: User = {
      id: insertedUser.id,
      accessCode: insertedUser.access_code,
      name: insertedUser.name,
      cpf: insertedUser.cpf,
      role: newUserData.role,
      permissions: newUserData.permissions,
      active: insertedUser.active ?? true,
      createdAt: new Date(insertedUser.created_at),
    };

    await refreshUsers();
    return newUser;
  };

  const updateUser = async (id: string, userData: Partial<User> & { password?: string }) => {
    // Update app_users
    const updateData: Record<string, unknown> = {};
    if (userData.name) updateData.name = userData.name;
    if (userData.cpf) updateData.cpf = userData.cpf;
    if (userData.active !== undefined) updateData.active = userData.active;
    if (userData.password) updateData.password_hash = userData.password;

    if (Object.keys(updateData).length > 0) {
      await supabase.from('app_users').update(updateData).eq('id', id);
    }

    // Update role if changed
    if (userData.role) {
      await supabase.from('user_roles').delete().eq('user_id', id);
      await supabase.from('user_roles').insert({
        user_id: id,
        role: userData.role,
      });
    }

    // Update permissions if changed
    if (userData.permissions) {
      await supabase.from('user_permissions').delete().eq('user_id', id);
      for (const perm of userData.permissions) {
        await supabase.from('user_permissions').insert({
          user_id: id,
          module: perm.module,
          actions: perm.actions,
        });
      }
    }

    await refreshUsers();

    // Update current session if updating logged user
    if (user?.id === id) {
      const updatedUser = users.find((u) => u.id === id);
      if (updatedUser) {
        setUser({ ...updatedUser, ...userData } as User);
      }
    }
  };

  const deleteUser = async (id: string) => {
    await supabase.from('app_users').delete().eq('id', id);
    await refreshUsers();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        getNextAccessCode,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
