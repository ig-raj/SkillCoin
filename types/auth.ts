export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
  isVerified: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AdminPermissions {
  canCreateSkillTracks: boolean;
  canCreateJobPosts: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canModerateContent: boolean;
}

export const ADMIN_EMAIL = 'rg3rd07@gmail.com';

export const getAdminPermissions = (user: User | null): AdminPermissions => {
  const isAdmin = user?.role === 'admin' && user?.email === ADMIN_EMAIL;
  
  return {
    canCreateSkillTracks: isAdmin,
    canCreateJobPosts: isAdmin,
    canManageUsers: isAdmin,
    canViewAnalytics: isAdmin,
    canModerateContent: isAdmin,
  };
};