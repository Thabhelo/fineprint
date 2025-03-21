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
    // Skip auth initialization if Supabase isn't configured
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Failed to retrieve session:", error);
          toast.error("Failed to retrieve session.");
          setLoading(false);
          return;
        }
        
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserRole(session.user.id);
        }
        setLoading(false);
      } catch (err) {
        console.error("Unexpected error getting session:", err);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
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
      // First, try to get the role from user_profiles table
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        // If no profile found, try user metadata
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (!userError && userData?.user?.user_metadata?.role) {
          setRole(userData.user.user_metadata.role as string);
          return;
        }
        
        // If all else fails, set a default role
        console.error("Error fetching user role:", error);
        setRole('user');
        return;
      }
      
      // Role found in user_profiles
      setRole(data.role || 'user');
    } catch (error) {
      console.error("Unexpected error fetching user role:", error);
      setRole('user');
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!supabaseConfigured) {
      toast.error("Authentication is not configured.");
      throw new Error("Supabase not configured");
    }
    
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
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
      toast.error("Authentication is not configured.");
      throw new Error("Supabase not configured");
    }
    
    try {
      console.log('🔐 Attempting signin with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('❌ Error during signin:', error);
        throw error;
      }

      console.log('✅ Signin successful:', data.user.id);
      fetchUserRole(data.user.id);
      
      toast.success('Successfully signed in!');
      return data;
    } catch (error: any) {
      console.error('❌ Exception during signin:', error);
      
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please try again.');
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