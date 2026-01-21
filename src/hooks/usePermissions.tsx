import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasModuleAccess = (module: string): boolean => {
    if (!user) return false;
    if (user.role === 'diretor') return true;
    return user.permissions.some((p) => p.module === module);
  };

  const hasActionAccess = (module: string, action: string): boolean => {
    if (!user) return false;
    if (user.role === 'diretor') return true;
    const permission = user.permissions.find((p) => p.module === module);
    return permission?.actions.includes(action) ?? false;
  };

  return {
    hasModuleAccess,
    hasActionAccess,
    isAdmin: user?.role === 'diretor',
  };
};
