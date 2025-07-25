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
      console.log('Checking admin role for user:', userId);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('RPC timeout')), 5000)
      );
      
      const rpcPromise = supabase
        .rpc('get_admin_user_by_id', { check_user_id: userId });
      
      const { data: adminData, error } = await Promise.race([rpcPromise, timeoutPromise]) as any;

      console.log('RPC response:', { adminData, error });

      if (error) {
        console.error('Error calling get_admin_user_by_id:', error);
        return null;
      }

      if (!adminData || adminData.length === 0) {
        console.log('User is not an admin');
        return null;
      }

      console.log('Admin role found:', adminData[0]);
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
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Check if user has admin role with timeout
          try {
            const adminData = await checkAdminRole(session.user.id);
            if (mounted) {
              setAdminUser(adminData);
            }
          } catch (error) {
            console.error('Admin check failed:', error);
            if (mounted) {
              setAdminUser(null);
            }
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
      
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          const adminData = await checkAdminRole(session.user.id);
          if (mounted) {
            setAdminUser(adminData);
          }
        } catch (error) {
          console.error('Initial admin check failed:', error);
          if (mounted) {
            setAdminUser(null);
          }
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
    console.log('Login attempt started');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }

      console.log('Auth successful, checking admin role...');
      
      // The onAuthStateChange listener will handle the admin role check
      // and set loading states appropriately
    } catch (error) {
      console.error('Login failed:', error);
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