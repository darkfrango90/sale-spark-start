import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, DEFAULT_ADMIN } from '@/types/user';

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (accessCode: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'accessCode' | 'createdAt'>) => User;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getNextAccessCode: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'cezar_users';
const SESSION_KEY = 'cezar_session';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load users from localStorage
    const storedUsers = localStorage.getItem(STORAGE_KEY);
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers).map((u: User) => ({
        ...u,
        createdAt: new Date(u.createdAt),
      }));
      setUsers(parsedUsers);
    } else {
      // Initialize with default admin
      setUsers([DEFAULT_ADMIN]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([DEFAULT_ADMIN]));
    }

    // Check for existing session
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      const sessionUser = JSON.parse(session);
      setUser({
        ...sessionUser,
        createdAt: new Date(sessionUser.createdAt),
      });
    }
  }, []);

  const login = (accessCode: string, password: string): boolean => {
    const foundUser = users.find(
      (u) => u.accessCode === accessCode && u.password === password && u.active
    );
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const getNextAccessCode = (): string => {
    const codes = users.map((u) => parseInt(u.accessCode, 10));
    const maxCode = codes.length > 0 ? Math.max(...codes) : 0;
    return String(maxCode + 1).padStart(3, '0');
  };

  const addUser = (newUserData: Omit<User, 'id' | 'accessCode' | 'createdAt'>): User => {
    const newUser: User = {
      ...newUserData,
      id: crypto.randomUUID(),
      accessCode: getNextAccessCode(),
      createdAt: new Date(),
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    return newUser;
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    const updatedUsers = users.map((u) => (u.id === id ? { ...u, ...userData } : u));
    setUsers(updatedUsers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    
    // Update current session if updating logged user
    if (user?.id === id) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    }
  };

  const deleteUser = (id: string) => {
    const updatedUsers = users.filter((u) => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated: !!user,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        getNextAccessCode,
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
