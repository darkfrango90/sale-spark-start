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
const TOKEN_KEY = 'cezar_auth_token';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      // Fetch all users with their roles and permissions
      const { data: appUsers, error: usersError } = await supabase
        .from('app_users')
        .select('id, access_code, name, cpf, active, created_at')
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

  // Verify stored token on mount
  const verifyStoredToken = async (): Promise<User | null> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Clear tokens on any non-OK response
      if (!response.ok) {
        console.warn('Token verification failed, clearing session');
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(SESSION_KEY);
        return null;
      }

      const data = await response.json();
      if (data.valid && data.user) {
        const fullUser: User = {
          id: data.user.id,
          accessCode: data.user.accessCode,
          name: data.user.name,
          cpf: data.user.cpf,
          role: data.user.role as User['role'],
          permissions: data.user.permissions.map((p: { module: string; actions: string[] }) => ({
            module: p.module,
            actions: p.actions || [],
          })),
          active: data.user.active ?? true,
          createdAt: new Date(),
        };
        return fullUser;
      }
      
      // Token was verified but no valid user data - clear session
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
      return null;
    } catch (error) {
      console.warn('Token verification error, clearing session:', error);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // Load users from database
      await fetchUsers();

      // Check for existing token and verify it
      const verifiedUser = await verifyStoredToken();
      if (verifiedUser) {
        setUser(verifiedUser);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (accessCode: string, password: string): Promise<boolean> => {
    try {
      // Use the secure server-side login function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accessCode, password })
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      if (data.token && data.user) {
        const fullUser: User = {
          id: data.user.id,
          accessCode: data.user.accessCode,
          name: data.user.name,
          cpf: data.user.cpf,
          role: data.user.role as User['role'],
          permissions: data.user.permissions.map((p: { module: string; actions: string[] }) => ({
            module: p.module,
            actions: p.actions || [],
          })),
          active: data.user.active ?? true,
          createdAt: new Date(),
        };

        setUser(fullUser);
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(SESSION_KEY, JSON.stringify({ id: data.user.id }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
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

  // Helper function to hash password using edge function
  const hashPassword = async (password: string): Promise<string> => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    // If no token, fall back to plain text (will be migrated on first login)
    if (!token) {
      return password;
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-hash-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        // Fall back to plain text if hashing fails
        console.warn('Password hashing failed, using plain text');
        return password;
      }

      const data = await response.json();
      return data.hashedPassword || password;
    } catch (error) {
      console.error('Password hashing error:', error);
      return password;
    }
  };

  const addUser = async (
    newUserData: Omit<User, 'id' | 'accessCode' | 'createdAt'> & { password: string }
  ): Promise<User> => {
    const accessCode = await getNextAccessCode();
    
    // Hash password before storing
    const hashedPassword = await hashPassword(newUserData.password);

    // Insert user
    const { data: insertedUser, error: insertError } = await supabase
      .from('app_users')
      .insert({
        access_code: accessCode,
        name: newUserData.name,
        cpf: newUserData.cpf,
        password_hash: hashedPassword,
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
    
    // Hash password if provided
    if (userData.password) {
      updateData.password_hash = await hashPassword(userData.password);
    }

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
