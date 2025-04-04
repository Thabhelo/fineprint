// Add JSON type alias to fix 'Cannot find name Json' error
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface ProcessedDocument {
  id: string;
  user_id: string;
  file_name: string;
  content: string;
  metadata: {
    title: string;
    type: "pdf" | "docx" | "image";
    pageCount?: number;
    wordCount: number;
    processedAt: string;
    ocrResults?: {
      confidence: number;
      language: string;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  user_id: string;
  title: string;
  url?: string;
  file_path?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  id: string;
  contract_id: string;
  risk_level: "low" | "medium" | "high";
  red_flags: any[];
  created_at: string;
}

export interface AnalysisIssue {
  id: string;
  contract_id: string;
  issue_type: string;
  description: string;
  severity: "low" | "medium" | "high";
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  company: string | null;
  role: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  email: string | null;
}

export interface UserSetting {
  id: string;
  user_id: string;
  email_notifications: boolean;
  notification_frequency: string;
  theme: string;
  language: string;
  setting_key: string;
  setting_value: any;
  created_at: string;
  updated_at: string;
}

export interface ConversationHistory {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      processed_documents: {
        Row: ProcessedDocument;
        Insert: Omit<ProcessedDocument, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<ProcessedDocument, "id" | "created_at" | "updated_at">
        >;
      };
      contracts: {
        Row: Contract;
        Insert: Omit<Contract, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Contract, "id" | "created_at" | "updated_at">>;
      };
      analysis_results: {
        Row: AnalysisResult;
        Insert: Omit<AnalysisResult, "id" | "created_at">;
        Update: Partial<Omit<AnalysisResult, "id" | "created_at">>;
      };
      analysis_issues: {
        Row: AnalysisIssue;
        Insert: Omit<AnalysisIssue, "id" | "created_at">;
        Update: Partial<Omit<AnalysisIssue, "id" | "created_at">>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<UserProfile, "id" | "created_at" | "updated_at">>;
      };
      user_settings: {
        Row: UserSetting;
        Insert: Omit<UserSetting, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<UserSetting, "id" | "created_at" | "updated_at">>;
      };
      conversation_history: {
        Row: ConversationHistory;
        Insert: Omit<ConversationHistory, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<ConversationHistory, "id" | "created_at" | "updated_at">
        >;
      };
      user_notifications: {
        Row: UserNotification;
        Insert: Omit<UserNotification, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<UserNotification, "id" | "created_at" | "updated_at">
        >;
      };
    };
  };
}
