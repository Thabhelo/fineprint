export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Add GroqMessage to Json compatible types
export interface GroqCompatible {
  [key: string]: Json | undefined;
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          company: string | null;
          role: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          email: string | null; // Added this field which exists in your schema
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          company?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          email?: string | null; // Added this field
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          company?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          email?: string | null; // Added this field
        };
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string; // Changed from userId to user_id
          email_notifications: boolean; // Changed from emailNotifications
          notification_frequency: string; // Changed from notificationFrequency
          theme: string;
          language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string; // Changed from userId
          email_notifications?: boolean; // Changed from emailNotifications
          notification_frequency?: string; // Changed from notificationFrequency
          theme?: string;
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string; // Changed from userId
          email_notifications?: boolean; // Changed from emailNotifications
          notification_frequency?: string; // Changed from notificationFrequency
          theme?: string;
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"; // Changed from userId_fkey
            columns: ["user_id"]; // Changed from userId
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      contracts: {
        Row: {
          id: string;
          title: string;
          content: string;
          user_id: string; // Changed from userId
          created_at: string;
          updated_at: string;
          url: string | null; // Added this field which exists in your schema
          file_path: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          user_id: string; // Changed from userId
          created_at?: string;
          updated_at?: string;
          url?: string | null; // Added this field
          file_path?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          user_id?: string; // Changed from userId
          created_at?: string;
          updated_at?: string;
          url?: string | null; // Added this field
          file_path?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contracts_user_id_fkey"; // Changed from userId_fkey
            columns: ["user_id"]; // Changed from userId
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      analysis_results: {
        Row: {
          id: string;
          contract_id: string; // Changed from contractId
          user_id: string; // Changed from userId
          risk_level: string; // Changed from riskLevel
          summary: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contract_id: string; // Changed from contractId
          user_id: string; // Changed from userId
          risk_level: string; // Changed from riskLevel
          summary: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contract_id?: string; // Changed from contractId
          user_id?: string; // Changed from userId
          risk_level?: string; // Changed from riskLevel
          summary?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analysis_results_contract_id_fkey"; // Changed from contractId_fkey
            columns: ["contract_id"]; // Changed from contractId
            isOneToOne: false;
            referencedRelation: "contracts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analysis_results_user_id_fkey"; // Changed from userId_fkey
            columns: ["user_id"]; // Changed from userId
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      usage_stats: {
        Row: {
          id: string;
          user_id: string;
          contracts_analyzed: number;
          total_words_analyzed: number;
          high_risk_detected: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          contracts_analyzed?: number;
          total_words_analyzed?: number;
          high_risk_detected?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          contracts_analyzed?: number;
          total_words_analyzed?: number;
          high_risk_detected?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "usage_stats_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      analysis_issues: {
        Row: {
          id: string;
          contract_id: string;
          user_id: string;
          issue_type: string;
          description: string;
          severity: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contract_id: string;
          user_id: string;
          issue_type: string;
          description: string;
          severity: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contract_id?: string;
          user_id?: string;
          issue_type?: string;
          description?: string;
          severity?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analysis_issues_contract_id_fkey";
            columns: ["contract_id"];
            isOneToOne: false;
            referencedRelation: "contracts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analysis_issues_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      conversation_history: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          messages: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          messages: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          messages?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
