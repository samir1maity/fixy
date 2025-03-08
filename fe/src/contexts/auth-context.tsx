import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import userApiService, { User } from '../services/user-api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          const userData = await userApiService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // If token is invalid or expired, clear it
          localStorage.removeItem('authToken');
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('authToken', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await userApiService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      logout();
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 