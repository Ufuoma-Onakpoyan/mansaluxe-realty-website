import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: 'super_admin' | 'editor' | 'viewer';
  created_at: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  adminUser: AdminUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check admin role for authenticated user using security definer function
  const checkAdminRole = async (userId: string) => {
    try {
      const { data: adminData, error } = await supabase
        .rpc('get_admin_user_by_id', { check_user_id: userId });

      if (error) {
        console.error('Error calling get_admin_user_by_id:', error);
        return null;
      }

      if (!adminData || adminData.length === 0) {
        console.log('User is not an admin');
        return null;
      }

      return adminData[0] as AdminUser;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Check if user has admin role
          const adminData = await checkAdminRole(session.user.id);
          setAdminUser(adminData);
        } else {
          setAdminUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const adminData = await checkAdminRole(session.user.id);
        setAdminUser(adminData);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user has admin role
      if (data.user) {
        const adminData = await checkAdminRole(data.user.id);
        if (!adminData || !['super_admin', 'editor'].includes(adminData.role)) {
          // Sign out if user is not an admin
          await supabase.auth.signOut();
          throw new Error('Access denied. Admin privileges required.');
        }
        setAdminUser(adminData);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      // Note: User will need to be added to admin_users table manually
      // or we can create them automatically if they're in the admin_users table
      if (data.user) {
        console.log('User created:', data.user.email);
      }
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setAdminUser(null);
      // Force redirect to login page after logout
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login
      window.location.href = '/admin/login';
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    adminUser,
    session,
    login,
    signup,
    logout,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: !!adminUser && ['super_admin', 'editor'].includes(adminUser.role)
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