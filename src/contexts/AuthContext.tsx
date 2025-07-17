import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAPI, User } from '@/lib/admin-api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ requiresTwoFactor?: boolean }>;
  verifyTwoFactor: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isTwoFactorPending: boolean;
  hasPermission: (permission: string) => boolean;
  userRole: 'Admin' | 'Agent' | 'Staff' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [isTwoFactorPending, setIsTwoFactorPending] = useState(false);

  useEffect(() => {
    // Check for existing token on app start
    const token = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');
    
    if (token && savedUser) {
      // TODO: Verify token with backend
      adminAPI.verifyToken(token).then(isValid => {
        if (isValid) {
          setUser(JSON.parse(savedUser));
        } else {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with real authentication
      const { token, user: loggedInUser, requiresTwoFactor } = await adminAPI.login(email, password);
      
      if (requiresTwoFactor) {
        // Store user ID for 2FA verification but don't set as logged in yet
        setPendingUserId(loggedInUser.id);
        setIsTwoFactorPending(true);
        setIsLoading(false);
        return { requiresTwoFactor: true };
      }
      
      // No 2FA required, complete login
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return {};
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifyTwoFactor = async (code: string) => {
    if (!pendingUserId) {
      throw new Error('No pending two-factor authentication');
    }
    
    setIsLoading(true);
    try {
      const { token } = await adminAPI.verifyTwoFactorCode(pendingUserId, code);
      
      // Fetch user details again with the new verified token
      const response = await fetch('/data/users.json');
      const users = await response.json();
      const verifiedUser = users.find((u: User) => u.id === pendingUserId);
      
      if (!verifiedUser) {
        throw new Error('User not found');
      }
      
      // Mark as verified and complete login
      verifiedUser.twoFactorVerified = true;
      
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(verifiedUser));
      
      setUser(verifiedUser);
      setPendingUserId(null);
      setIsTwoFactorPending(false);
    } catch (error) {
      console.error('Two-factor verification failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await adminAPI.resetPassword(email);
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateUser = async (data: Partial<User>) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    setIsLoading(true);
    try {
      const updatedUser = await adminAPI.updateUser(user.id, data);
      setUser(updatedUser);
      localStorage.setItem('admin_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('User update failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await adminAPI.logout();
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const hasPermission = (permission: string) => {
    return user?.permissions.includes(permission) || user?.permissions.includes('full_access') || false;
  };
  
  const userRole = user ? user.role : null;

  const value = {
    user,
    login,
    verifyTwoFactor,
    logout,
    resetPassword,
    updateUser,
    isLoading,
    isAuthenticated: !!user,
    isTwoFactorPending,
    hasPermission,
    userRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}