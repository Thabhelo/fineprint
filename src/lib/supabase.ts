import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

import { sendAnalysisEmail } from './email';

// Load Supabase credentials
const SUPABASE_URL = 'https://quqzfvucxdvlqvnjnwkn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1cXpmdnVjeGR2bHF2bmpud2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMDk4OTEsImV4cCI6MjA1Nzg4NTg5MX0.VHJQ_esE8FwJ54eeg_nUelxvB4Sy9vctnouVaThQip0';

// Debug log for environment variables
console.log('Supabase Config Check:');
console.log('- URL exists:', !!SUPABASE_URL);
console.log('- Key exists:', !!SUPABASE_ANON_KEY);
console.log('- URL preview:', SUPABASE_URL ? `${SUPABASE_URL.substring(0, 20)}...` : 'missing');
console.log('- Key preview:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 10)}...` : 'missing');

// Export isConfigured check for reuse
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Create a typed Supabase client - only if configuration exists
export const supabase = isSupabaseConfigured 
  ? createClient<Database>(
      SUPABASE_URL!,
      SUPABASE_ANON_KEY!,
      {
        auth: { 
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        },
      }
    )
  : createClient<Database>(
      'https://placeholder-url.supabase.co',
      'placeholder-key',
      {
        auth: { persistSession: true },
      }
    );

// Test Supabase connection on initialization (only if configured)
if (isSupabaseConfigured) {
  (async function testConnection() {
    try {
      const { error } = await supabase.from('user_profiles').select('count').limit(1);
      if (error) {
        console.error('❌ Supabase connection test failed:', error.message);
      } else {
        console.log('✅ Supabase connection test successful');
      }
    } catch (err) {
      console.error('❌ Unexpected error testing Supabase connection:', err);
    }
  })();
}

/** 🔹 Get current user (Helper) */
async function getUser() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) throw new Error('🔑 User not authenticated');
  return data.user;
}

/** 🔹 Interfaces */
export type Contract = Database['public']['Tables']['contracts']['Row'];
export type AnalysisResult = Database['public']['Tables']['analysis_results']['Row'];
export type AnalysisIssue = Database['public']['Tables']['analysis_issues']['Row'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type ConversationHistory = Database['public']['Tables']['conversation_history']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

/** 🔹 Save a conversation */
export async function saveConversation(title: string, messages: GroqMessage[]) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }
  
  try {
    const user = await getUser();

    // Cast messages to be Json compatible
    const jsonMessages = messages as unknown as GroqCompatible[];

    const { data, error } = await supabase
      .from('conversation_history')
      .insert({
        user_id: user.id,
        title: title || (messages.length ? messages[0]?.content.slice(0, 50) + '...' : 'Untitled Conversation'),
        messages: jsonMessages
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('⚠️ Error saving conversation:', error);
    throw error;
  }
}

/** 🔹 Get recent conversations */
export async function getRecentConversations(limit = 5) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }
  
  try {
    const user = await getUser();
    const { data, error } = await supabase
      .from('conversation_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('⚠️ Error getting recent conversations:', error);
    throw error;
  }
}

/** 🔹 Analyze a contract */
export async function analyzeContract(content: string, url?: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }
  
  try {
    const user = await getUser();

    // Insert contract record
    const { data: contract, error } = await supabase
      .from('contracts')
      .insert({
        content,
        title: url ? new URL(url).hostname : 'Manual Analysis',
        user_id: user.id,
        url: url || null
      })
      .select()
      .single();

    if (error) throw error;

    // For now, we'll use placeholder analysis data
    // In a real implementation, this would come from your AI analysis
    const analysis = { risk_level: 'medium' as const };
    
    // Get user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settingsError) {
      console.warn('⚠️ No user settings found. Creating defaults.');
      // Create default settings if none exist
      const defaultSettings = {
        user_id: user.id,
        email_notifications: true,
        notification_frequency: 'instant',
        theme: 'light',
        language: 'en'
      };
      
      await updateUserSettings(defaultSettings);
    }

    // Placeholder for issues (would come from AI analysis)
    const issues: Partial<AnalysisIssue>[] = [];
    
    // Insert analysis result
    const { error: analysisError } = await supabase
    .from('analysis_results')
    .insert({
      contract_id: contract.id,
      user_id: user.id,
      risk_level: analysis.risk_level,
      summary: 'Analysis completed',
    });

    if (analysisError) throw analysisError;

    // Send email notification if enabled
    if (settings?.email_notifications) {
      if (user.email) {
        try {
          await sendAnalysisEmail(user.email, {
            userName: user.email.split('@')[0],
            contractTitle: contract.title,
            riskLevel: analysis.risk_level,
            issuesCount: issues.length,
          });
        } catch (emailError) {
          console.error('⚠️ Error sending email notification:', emailError);
          // Don't throw here, just log the error
        }
      }
    }

    return { 
      contract, 
      analysis, 
      issues, 
      emailNotifications: settings?.email_notifications || false, 
      notificationFrequency: settings?.notification_frequency || 'instant' 
    };
  } catch (error) {
    console.error('⚠️ Error analyzing contract:', error);
    throw error;
  }
}

/** 🔹 Get user settings */
export async function getUserSettings() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }
  
  try {
    const user = await getUser();
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no settings found, create default settings
      if (error.code === 'PGRST116') { // No rows returned
        const defaultSettings = {
          user_id: user.id,
          email_notifications: true,
          notification_frequency: 'instant',
          theme: 'light',
          language: 'en'
        };
        
        return updateUserSettings(defaultSettings);
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('⚠️ Error fetching user settings:', error);
    throw error;
  }
}

/** 🔹 Update user settings */
/** 🔹 Update user settings */
export async function updateUserSettings(settingsData: Partial<UserSettings>) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }
  
  try {
    const user = await getUser();
    
    // Create settings object with required user_id
    // Use type assertion to ensure TypeScript knows user_id is definitely present
    const settings = {
      user_id: user.id,
      ...(settingsData as Partial<Omit<UserSettings, 'user_id'>>)
    } as { user_id: string } & Partial<UserSettings>;
    
    // Handle both camelCase and snake_case input keys
    // This is a safety measure if your frontend still passes camelCase
    if ('emailNotifications' in settingsData) {
      settings.email_notifications = settingsData.emailNotifications as boolean;
    }
    
    if ('notificationFrequency' in settingsData) {
      settings.notification_frequency = settingsData.notificationFrequency as string;
    }

    // Check if settings already exist
    const { data: existingSettings, error: checkError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    let data;
    
    if (existingSettings) {
      // Update existing settings
      const { data: updateData, error: updateError } = await supabase
        .from('user_settings')
        .update(settings)
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (updateError) throw updateError;
      data = updateData;
    } else {
      // Set required fields for new settings if not already set
      if (!settings.email_notifications) settings.email_notifications = true;
      if (!settings.notification_frequency) settings.notification_frequency = 'daily';
      if (!settings.theme) settings.theme = 'light';
      if (!settings.language) settings.language = 'en';
      
      // Insert new settings
      const { data: insertData, error: insertError } = await supabase
        .from('user_settings')
        .insert(settings)
        .select()
        .single();
        
      if (insertError) throw insertError;
      data = insertData;
    }

    return data;
  } catch (error) {
    console.error('⚠️ Error updating user settings:', error);
    throw error;
  }
}

/** 🔹 Get user profile */
export async function getUserProfile() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }
  
  try {
    const user = await getUser();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('⚠️ Error fetching user profile:', error);
    throw error;
  }
}

/** 🔹 Update user profile */
export async function updateUserProfile(profile: Partial<UserProfile>) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }
  
  try {
    const user = await getUser();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profile)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('⚠️ Error updating user profile:', error);
    throw error;
  }
}

/** 🔹 Get notifications */
export async function getNotifications() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }
  
  try {
    const user = await getUser();
    
    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('⚠️ Error fetching notifications:', error);
    throw error;
  }
}

/** 🔹 Mark notification as read */
export async function markNotificationAsRead(id: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }
  
  try {
    const { error } = await supabase
      .from('user_notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
    return { message: '✅ Notification marked as read' };
  } catch (error) {
    console.error('⚠️ Error marking notification as read:', error);
    throw error;
  }
}