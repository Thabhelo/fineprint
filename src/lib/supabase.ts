import { createClient } from '@supabase/supabase-js';
import type { Database, GroqCompatible } from './database.types';  // Import generated Supabase types
import { GroqMessage } from './groq';
import { sendAnalysisEmail } from './email';

// Load Supabase credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ensure environment variables are set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials');
  // Don't throw an error here, as it would crash the app during initial loading
  // Instead, let the auth context handle the lack of configuration
}

// Create a typed Supabase client
export const supabase = createClient<Database>(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || '',
  {
    global: { fetch: (...args) => fetch(...args) }, // Ensures compatibility
    auth: { persistSession: true }, // Ensures user session persistence
  }
);

/** 🔹 Get current user (Helper) */
async function getUser() {
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
  try {
    const user = await getUser();

    // Cast messages to be Json compatible
    const jsonMessages = messages as unknown as GroqCompatible[];

    const { data, error } = await supabase
      .from('conversation_history')
      .insert({
        userId: user.id,
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
  try {
    const user = await getUser();
    const { data, error } = await supabase
      .from('conversation_history')
      .select('*')
      .eq('userId', user.id)
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
  try {
    const user = await getUser();

    // Insert contract record
    const { data: contract, error } = await supabase
      .from('contracts')
      .insert({
        content,
        title: url ? new URL(url).hostname : 'Manual Analysis',
        userId: user.id, // Make sure the schema has a userId field
      })
      .select()
      .single();

    if (error) throw error;

    // For now, we'll use placeholder analysis data
    // In a real implementation, this would come from your AI analysis
    const analysis = { riskLevel: 'medium' as const };
    
    // Get user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('userId', user.id)
      .single();

    if (settingsError) {
      console.warn('⚠️ No user settings found. Creating defaults.');
      // Create default settings if none exist
      const defaultSettings = {
        userId: user.id,
        emailNotifications: true,
        notificationFrequency: 'instant',
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
      contractId: contract.id,
      userId: user.id,
      riskLevel: analysis.riskLevel,
      summary: 'Analysis completed',
    });

    if (analysisError) throw analysisError;

    // Send email notification if enabled
    if (settings?.emailNotifications) {
      if (user.email) {
        try {
          await sendAnalysisEmail(user.email, {
            userName: user.email.split('@')[0],
            contractTitle: contract.title,
            riskLevel: analysis.riskLevel,
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
      emailNotifications: settings?.emailNotifications || false, 
      notificationFrequency: settings?.notificationFrequency || 'instant' 
    };
  } catch (error) {
    console.error('⚠️ Error analyzing contract:', error);
    throw error;
  }
}

/** 🔹 Get user settings */
export async function getUserSettings() {
  try {
    const user = await getUser();
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('userId', user.id)
      .single();

    if (error) {
      // If no settings found, create default settings
      if (error.code === 'PGRST116') { // No rows returned
        const defaultSettings = {
          userId: user.id,
          emailNotifications: true,
          notificationFrequency: 'instant',
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
export async function updateUserSettings(settingsData: Partial<UserSettings>) {
  try {
    const user = await getUser();
    const settings = {
      ...(settingsData as object),
      userId: user.id
    } as UserSettings;

    // Check if settings already exist
    const { data: existingSettings, error: checkError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('userId', user.id)
      .maybeSingle();
      
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    let data;
    
    if (existingSettings) {
      // Update existing settings
      const { data: updateData, error: updateError } = await supabase
        .from('user_settings')
        .update(settings)
        .eq('userId', user.id)
        .select()
        .single();
        
      if (updateError) throw updateError;
      data = updateData;
    } else {
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
  try {
    const user = await getUser();
    
    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('userId', user.id)
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