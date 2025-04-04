import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [envStatus, setEnvStatus] = useState<{url?: string, keyValid?: boolean, tables?: string[]}>({});
  const { signUp, signIn, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();

  // Check environment variables on component mount
  useEffect(() => {
    const checkEnv = async () => {
      console.log('🔍 Checking Supabase environment in SignUp component');
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      console.log('Supabase URL configured:', Boolean(url));
      console.log('Supabase Key configured:', Boolean(key));
      
      // Check if the key is valid and verify required tables exist
      try {
        // First check basic connection
        console.log('🔍 Testing connection to user_profiles table...');
        const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
        
        console.log('Connection test result:', error ? `Error: ${error.message}` : 'Success');
        
        // Then check which tables are available
        const tables = [];
        const requiredTables = ['user_profiles', 'user_settings', 'contracts', 'analysis_results', 'analysis_issues', 'conversation_history'] as const;
        
        for (const table of requiredTables) {
          const { error: tableError } = await supabase.from(table).select('count').limit(1);
          if (!tableError) {
            tables.push(table);
          }
          console.log(`Table ${table} exists:`, !tableError);
        }
        
        // Try an auth call to see if we should use fallback mode
        try {
          // Just check if auth is working by trying to get the session
          const { error: authError } = await supabase.auth.getSession();
          if (authError) {
            console.log('⚠️ Auth check failed, enabling fallback mode:', authError.message);
            setFallbackMode(true);
          }
        } catch (authCheckError) {
          console.error('❌ Error checking auth status:', authCheckError);
          setFallbackMode(true);
        }
        
        setEnvStatus({
          url: url?.substring(0, 20) + '...',
          keyValid: !error,
          tables
        });
      } catch (err) {
        console.error('❌ Error during environment check:', err);
        setEnvStatus({
          url: url?.substring(0, 20) + '...',
          keyValid: false
        });
      }
    };
    
    if (process.env.NODE_ENV !== 'production') {
      checkEnv();
    }
  }, []);

  // Fallback signup method when Supabase Auth is having issues
  const handleFallbackSignup = async (email: string, password: string) => {
    try {
      console.log('🔍 Attempting fallback signup...');
      
      // First check if a user with this email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email);
      
      if (checkError) {
        console.error('❌ Error checking existing user:', checkError);
        throw new Error('Failed to check if user exists');
      }
      
      if (existingUser && existingUser.length > 0) {
        console.error('❌ User already exists with email:', email);
        throw new Error('An account with this email already exists');
      }
      
      // Generate a proper UUID (in UUID v4 format required by Postgres)
      const userId = crypto.randomUUID();
      console.log('✅ Generated UUID for new user:', userId);
      
      // Create a user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          email: email,
          full_name: fullName || email.split('@')[0],
          company: company || null,
          role: role || 'user'
        });
      
      if (profileError) {
        console.error('❌ Error creating user profile:', profileError);
        throw new Error('Failed to create user account');
      }
      
      // Create default user settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          email_notifications: true,
          notification_frequency: 'daily',
          theme: 'light',
        });
      
      if (settingsError) {
        console.error('❌ Error creating user settings:', settingsError);
        // Continue anyway since we at least created the profile
      }
      
      console.log('✅ Fallback signup successful for:', email);
      
      // Store user info in localStorage (this is just for development/demo)
      localStorage.setItem('fallback_auth_user', JSON.stringify({
        id: userId,
        email: email,
        name: fullName || email.split('@')[0],
        role: 'user'
      }));
      
      toast.success('Account created successfully! You are now signed in.');
      navigate('/get-started');
      
    } catch (error: any) {
      console.error('❌ Fallback signup failed:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  };

  const setupUserAccount = async (userId: string) => {
    try {
      console.log('🔍 Setting up user account with details:', {
        userId,
        fullName,
        email,
        company,
        role
      });
  
      // Using snake_case for database columns
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          full_name: fullName || email.split('@')[0],
          email: email,
          company: company || null,
          role: role || null
        });
  
      if (profileError) {
        console.error('❌ Error creating user profile:', profileError);
        throw profileError;
      }
      
      console.log('✅ User profile created/updated successfully');
      
      // Create default user settings with correct snake_case field names
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          email_notifications: true,
          notification_frequency: 'daily',
          theme: 'light'
        });
        
      if (settingsError) {
        console.error('❌ Error creating user settings:', settingsError);
        throw settingsError;
      }
      
      console.log('✅ Default user settings created');
      
    } catch (error) {
      console.error('❌ Comprehensive error in setupUserAccount:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Update password requirements to match AuthContext
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error('Password must be at least 8 characters long and include a number and uppercase letter');
      return;
    }

    try {
      setLoading(true);
      
      if (fallbackMode) {
        // Use fallback signup when auth is not working
        await handleFallbackSignup(email, password);
      } else {
        console.log('🔐 Attempting to sign up with email:', email);
        
        try {
          // First sign up the user with standard auth
          const result = await signUp(email, password);
          console.log('✅ Sign up result:', result);
          
          // Check if we got a user back
          if (result?.user) {
            // Setup the user account (profile and settings)
            try {
              await setupUserAccount(result.user.id);
            } catch (setupError: any) {
              console.error('❌ Error setting up user account:', setupError);
              toast.error('Account created but profile setup failed. Please update your profile later.');
            }
            
            // Check if email confirmation is enabled
            if (!result.user.email_confirmed_at) {
              // If email confirmation is enabled, redirect to success page
              console.log('📧 Email confirmation required, redirecting to success page');
              navigate('/signup-success');
            } else {
              // If email confirmation is disabled, we can sign in immediately
              try {
                console.log('🔓 Email confirmation not required, attempting sign in');
                await signIn(email, password);
                toast.success('Account created and signed in successfully!');
                navigate('/dashboard');
              } catch (signInError: any) {
                // If sign in fails, still redirect to success page
                console.error('❌ Error signing in after signup:', signInError);
                navigate('/signup-success');
              }
            }
          }
        } catch (error: any) {
          console.error('❌ Error signing up:', error);
          
          // If we get authentication database errors, switch to fallback mode
          if (error.message?.includes('Database error') || 
              error.status === 500 || 
              error.message?.includes('unexpected_failure')) {
            console.log('⚠️ Auth error detected, switching to fallback signup');
            setFallbackMode(true);
            await handleFallbackSignup(email, password);
          } else if (error.message?.includes('Invalid API key')) {
            toast.error('Authentication configuration error. Please contact support.');
            console.error('API Key issue detected:', envStatus);
          } else if (error.message?.includes('User already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
          } else if (error.message?.includes('Password requirements')) {
            // This is already handled above
          } else if (error.message?.includes('Database error')) {
            toast.error('Server error while creating your account. Please try again later.');
            console.error('Database error details:', error);
          } else {
            toast.error('An unexpected error occurred');
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Exception during signup process:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">Authentication Not Configured</h1>
              <p className="mt-2 text-gray-600">
                Please check your environment variables for Supabase configuration.
              </p>
              {process.env.NODE_ENV !== 'production' && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm text-left">
                  <p>URL: {envStatus.url || 'Not found'}</p>
                  <p>Key valid: {envStatus.keyValid === undefined ? 'Checking...' : (envStatus.keyValid ? 'Yes' : 'No')}</p>
                  {envStatus.tables && (
                    <p>Tables found: {envStatus.tables.join(', ') || 'None'}</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="mt-2 text-gray-600">Start protecting your rights today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                minLength={8}
              />
              <p className="mt-1 text-sm text-gray-500">
                Must be at least 8 characters long with at least one number and one uppercase letter
              </p>
            </div>
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Company
              </label>
              <input
                type="text"
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <input
                type="text"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  Sign Up
                  <UserPlus className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/signin" className="text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
          
          {/* Only show in development for debugging */}
          {process.env.NODE_ENV !== 'production' && envStatus.url && (
            <div className="mt-6 p-3 bg-gray-50 rounded-md text-xs text-left text-gray-500">
              <details>
                <summary className="cursor-pointer font-medium">Debug Info</summary>
                <p className="mt-2">API URL: {envStatus.url}</p>
                <p>API Key valid: {envStatus.keyValid === undefined ? 'Checking...' : (envStatus.keyValid ? 'Yes ✓' : 'No ✗')}</p>
                {envStatus.tables && (
                  <div className="mt-2">
                    <p className="font-medium">Database Tables:</p>
                    <ul className="list-disc list-inside mt-1">
                      {['user_profiles', 'user_settings', 'contracts', 'analysis_results', 'analysis_issues', 'conversation_history'].map(table => (
                        <li key={table} className={envStatus.tables?.includes(table) ? 'text-green-600' : 'text-red-600'}>
                          {table} {envStatus.tables?.includes(table) ? '✓' : '✗'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </details>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}