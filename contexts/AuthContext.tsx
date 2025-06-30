import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { authenticateUser, registerUser, getCurrentUser, saveCurrentUser, clearCurrentUser } from '@/utils/authManager';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const user = await getCurrentUser();
      setAuthState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error checking auth state:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const user = await authenticateUser(credentials);
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      await saveCurrentUser(user);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const user = await registerUser(credentials);
      await saveCurrentUser(user);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await clearCurrentUser();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const refreshUser = async () => {
    const user = await getCurrentUser();
    setAuthState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};