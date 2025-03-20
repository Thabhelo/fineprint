export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          company: string | null
          role: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          company?: string | null
          role?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          company?: string | null
          role?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          email_notifications: boolean
          notification_frequency: 'daily' | 'weekly' | 'instant'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_notifications?: boolean
          notification_frequency?: 'daily' | 'weekly' | 'instant'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_notifications?: boolean
          notification_frequency?: 'daily' | 'weekly' | 'instant'
          created_at?: string
          updated_at?: string
        }
      }
      contracts: {
        Row: {
          id: string
          user_id: string
          content: string
          title: string
          url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          title: string
          url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          title?: string
          url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      analysis_results: {
        Row: {
          id: string
          contract_id: string
          risk_level: 'low' | 'medium' | 'high'
          created_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          risk_level: 'low' | 'medium' | 'high'
          created_at?: string
        }
        Update: {
          id?: string
          contract_id?: string
          risk_level?: 'low' | 'medium' | 'high'
          created_at?: string
        }
      }
      analysis_issues: {
        Row: {
          id: string
          analysis_id: string
          severity: 'low' | 'medium' | 'high'
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          analysis_id: string
          severity: 'low' | 'medium' | 'high'
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          analysis_id?: string
          severity?: 'low' | 'medium' | 'high'
          description?: string
          created_at?: string
        }
      }
      user_notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          read?: boolean
          created_at?: string
        }
      }
      admin_logs: {
        Row: {
          id: string
          action: string
          created_at: string
          details: Json
        }
        Insert: {
          id?: string
          action: string
          created_at?: string
          details: Json
        }
        Update: {
          id?: string
          action?: string
          created_at?: string
          details?: Json
        }
      }
      usage_stats: {
        Row: {
          id: string
          user_id: string
          action: string
          created_at: string
          details: Json
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          created_at?: string
          details: Json
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          created_at?: string
          details?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'user' | 'admin'
    }
  }
} 