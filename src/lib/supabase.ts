import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type { Database };

export interface Contract {
  id: string;
  user_id: string;
  content: string;
  title: string;
  url?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  id: string;
  contract_id: string;
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface AnalysisIssue {
  id: string;
  analysis_id: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  notification_frequency: 'daily' | 'weekly' | 'instant';
  created_at: string;
  updated_at: string;
}

export interface ConversationHistory {
  id: string;
  user_id: string;
  title: string;
  messages: GroqMessage[];
  created_at: string;
  updated_at: string;
}

export async function saveConversation(title: string, messages: GroqMessage[]) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('conversation_history')
      .insert({
        user_id: user.id,
        title: title || messages[0]?.content?.slice(0, 50) + '...',
        messages
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
}

export async function getRecentConversations(limit = 5) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('conversation_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting recent conversations:', error);
    throw error;
  }
}

export async function analyzeContract(content: string, url?: string) {
  try {
    // First, save the contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .insert({
        content,
        title: url ? new URL(url).hostname : 'Manual Analysis',
        url
      })
      .select()
      .single();

    if (contractError) throw contractError;

    // Get real AI analysis
    const aiAnalysis = await analyzeContractWithAI(content);

    // Save analysis result
    const { data: analysis, error: analysisError } = await supabase
      .from('analysis_results')
      .insert({
        contract_id: contract.id,
        risk_level: aiAnalysis.riskLevel
      })
      .select()
      .single();

    if (analysisError) throw analysisError;

    // Save analysis issues
    const { error: issuesError } = await supabase
      .from('analysis_issues')
      .insert(
        aiAnalysis.issues.map(issue => ({
          analysis_id: analysis.id,
          ...issue
        }))
      );

    if (issuesError) throw issuesError;

    // Get user settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .single();

    // Send email notification if enabled
    if (settings?.email_notifications) {
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        await sendAnalysisEmail(user.data.user.email!, {
          userName: user.data.user.email!.split('@')[0],
          contractTitle: contract.title,
          riskLevel: aiAnalysis.riskLevel,
          issues: aiAnalysis.issues
        });
      }
    }

    return {
      contract,
      analysis,
      issues: aiAnalysis.issues
    };
  } catch (error) {
    console.error('Error analyzing contract:', error);
    throw error;
  }
}

export async function getContractHistory() {
  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      analysis_results (
        *,
        analysis_issues (*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUserSettings() {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserSettings(settings: Partial<UserSettings>) {
  const { data, error } = await supabase
    .from('user_settings')
    .update(settings)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getNotifications() {
  const { data, error } = await supabase
    .from('user_notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function markNotificationAsRead(id: string) {
  const { error } = await supabase
    .from('user_notifications')
    .update({ read: true })
    .eq('id', id);

  if (error) throw error;
}