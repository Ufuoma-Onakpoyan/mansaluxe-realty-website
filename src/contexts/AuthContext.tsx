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
        return null;
      }

      return adminData[0] as AdminUser;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Check if user has admin role
          const adminData = await checkAdminRole(session.user.id);
          if (mounted) {
            setAdminUser(adminData);
          }
        } else {
          if (mounted) {
            setAdminUser(null);
          }
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const adminData = await checkAdminRole(session.user.id);
        if (mounted) {
          setAdminUser(adminData);
        }
      }
      
      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // The onAuthStateChange listener will handle the admin role check
      // and set loading states appropriately
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setAdminUser(null);
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    adminUser,
    session,
    login,
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