import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  role: string | null;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isSupabaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use the shared check from supabase.ts
  const supabaseConfigured = isSupabaseConfigured;

  useEffect(() => {
    console.log('🔍 AuthProvider initializing, Supabase configured:', supabaseConfigured);
    
    // Skip auth initialization if Supabase isn't configured
    if (!supabaseConfigured) {
      console.log('⚠️ Skipping auth initialization - Supabase not configured');
      setLoading(false);
      return;
    }
    
    const getSession = async () => {
      try {
        console.log('🔍 Retrieving session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("❌ Failed to retrieve session:", error);
          toast.error("Failed to retrieve session.");
          setLoading(false);
          return;
        }
        
        console.log('Session result:', session ? 'Session found' : 'No session');
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('User found in session, fetching role...');
          fetchUserRole(session.user.id);
        } else {
          console.log('No user in session');
        }
        setLoading(false);
      } catch (err) {
        console.error("❌ Unexpected error getting session:", err);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔔 Auth state changed, event:', _event);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      if (authListener && typeof authListener.subscription?.unsubscribe === "function") {
        authListener.subscription.unsubscribe();
      }
    };
  }, [supabaseConfigured]);

  const fetchUserRole = async (userId: string) => {
    if (!supabaseConfigured) return;
    
    try {
      console.log('🔍 Fetching user role for user ID:', userId);
      // First, try to get the role from user_profiles table
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.log('❌ Error fetching role from user_profiles:', error.message);
        // If no profile found, try user metadata
        console.log('🔍 Falling back to user metadata for role...');
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (!userError && userData?.user?.user_metadata?.role) {
          console.log('✅ Found role in user metadata:', userData.user.user_metadata.role);
          setRole(userData.user.user_metadata.role as string);
          return;
        }
        
        // If all else fails, set a default role
        console.log('⚠️ No role found, using default role: user');
        setRole('user');
        return;
      }
      
      // Role found in user_profiles
      console.log('✅ Found role in user_profiles:', data.role || 'user');
      setRole(data.role || 'user');
    } catch (error) {
      console.error("❌ Unexpected error fetching user role:", error);
      setRole('user');
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!supabaseConfigured) {
      console.log('⚠️ Signup attempted but Supabase is not configured');
      toast.error("Authentication is not configured.");
      throw new Error("Supabase not configured");
    }
    
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      console.log('⚠️ Password requirements not met');
      toast.error("Password must be at least 8 characters long and include a number and an uppercase letter.");
      throw new Error("Password requirements not met");
    }
  
    try {
      console.log('🔐 Attempting signup with email:', email);
      
      // Using basic signup options to avoid schema issues
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            role: 'user'
          }
        }
      });
      
      if (error) {
        console.error('❌ Detailed signup error:', {
          message: error.message,
          status: error.status,
          code: error.code
        });
        
        // More specific error handling
        if (error.message.includes('User already exists')) {
          toast.error('An account with this email already exists.');
        } else {
          toast.error(error.message || "Signup failed");
        }
        
        throw error;
      }
      
      console.log('✅ Signup successful:', data);
      
      // Check if email confirmation is needed
      if (data.user && !data.user.email_confirmed_at) {
        console.log('📧 Email confirmation required for new signup');
      } else {
        console.log('📧 Email confirmation not required');
      }
      
      toast.success('Check your email to confirm your account!');
      return data;
    } catch (error: any) {
      console.error('❌ Exception during signup:', error);
      toast.error(error.message || "An unexpected error occurred");
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabaseConfigured) {
      console.log('⚠️ Sign in attempted but Supabase is not configured');
      toast.error("Authentication is not configured.");
      throw new Error("Supabase not configured");
    }
    
    try {
      console.log('🔐 Attempting signin with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('❌ Error during signin:', error);
        
        // Handle specific database schema error
        if (error.message.includes('Database error querying schema')) {
          console.error('❌ Supabase auth database schema error detected');
          
          // Check if we can still access other Supabase resources
          try {
            const { error: profileError } = await supabase
              .from('user_profiles')
              .select('count')
              .limit(1);
              
            if (profileError) {
              console.error('❌ Cannot access user_profiles table either:', profileError.message);
              toast.error('Authentication system is currently unavailable. Please contact support.');
            } else {
              console.log('✅ Can access user_profiles table, issue is specific to auth tables');
              toast.error('Authentication system is experiencing issues. Please try again later or contact support.');
            }
          } catch (testError) {
            console.error('❌ Error testing database access:', testError);
            toast.error('Cannot connect to the authentication service. Please try again later.');
          }
          
          throw new Error('Authentication system unavailable');
        }
        
        // Enhanced error logging
        if (error.message.includes('Invalid login credentials')) {
          console.log('⚠️ Invalid credentials error - checking if user exists...');
          
          // Check if user exists but credentials are wrong
          const { data: userData, error: userError } = await supabase.auth.signInWithOtp({ email });
          
          if (userError) {
            console.log('❌ Email OTP check failed:', userError.message);
            console.log('⚠️ User likely does not exist or has issues');
          } else {
            console.log('✅ Email OTP sent successfully - user exists but wrong password');
          }
        }
        
        throw error;
      }

      console.log('✅ Signin successful:', data.user.id);
      fetchUserRole(data.user.id);
      
      toast.success('Successfully signed in!');
      return data;
    } catch (error: any) {
      console.error('❌ Exception during signin:', error);
      
      // Present user-friendly error messages
      if (error.message === 'Authentication system unavailable') {
        // Already handled above
      } else if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else if (error.message.includes('rate limit')) {
        toast.error('Too many login attempts. Please try again later.');
      } else {
        toast.error(error.message || "An unexpected error occurred");
      }
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!supabaseConfigured) {
      toast.error("Authentication is not configured.");
      throw new Error("Supabase not configured");
    }
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(`Google sign in failed: ${error.message}`);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    if (!supabaseConfigured) {
      toast.error("Authentication is not configured.");
      throw new Error("Supabase not configured");
    }
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(`GitHub sign in failed: ${error.message}`);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    if (!supabaseConfigured) {
      toast.error("Authentication is not configured.");
      throw new Error("Supabase not configured");
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Password reset instructions sent to your email!');
    } catch (error: any) {
      toast.error(`Failed to send reset email: ${error.message}`);
      throw error;
    }
  };

  const signOut = async () => {
    if (!supabaseConfigured) {
      setUser(null);
      setRole(null);
      return;
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setRole(null);
      toast.success('Successfully signed out!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      signUp, 
      signIn, 
      signInWithGoogle,
      signInWithGithub,
      resetPassword,
      signOut, 
      loading, 
      isSupabaseConfigured: supabaseConfigured
    }}>
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