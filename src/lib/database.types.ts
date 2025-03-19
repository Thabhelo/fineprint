export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Add GroqMessage to Json compatible types
export interface GroqCompatible {
  [key: string]: Json | undefined;
}

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
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_settings: {
        Row: {
          id: string
          userId: string
          emailNotifications: boolean
          notificationFrequency: string
          theme: string
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          userId: string
          emailNotifications?: boolean
          notificationFrequency?: string
          theme?: string
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          userId?: string
          emailNotifications?: boolean
          notificationFrequency?: string
          theme?: string
          language?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_userId_fkey"
            columns: ["userId"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      contracts: {
        Row: {
          id: string
          title: string
          content: string
          userId: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          userId: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          userId?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      analysis_results: {
        Row: {
          id: string
          contractId: string
          userId: string
          riskLevel: string
          summary: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contractId: string
          userId: string
          riskLevel: string
          summary: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contractId?: string
          userId?: string
          riskLevel?: string
          summary?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_contractId_fkey"
            columns: ["contractId"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_results_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      analysis_issues: {
        Row: {
          id: string
          analysisId: string
          type: string
          severity: string
          description: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          analysisId: string
          type: string
          severity: string
          description: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          analysisId?: string
          type?: string
          severity?: string
          description?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_issues_analysisId_fkey"
            columns: ["analysisId"]
            isOneToOne: false
            referencedRelation: "analysis_results"
            referencedColumns: ["id"]
          }
        ]
      }
      conversation_history: {
        Row: {
          id: string
          userId: string
          title: string
          messages: Json[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          userId: string
          title: string
          messages: Json[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          userId?: string
          title?: string
          messages?: Json[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_history_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_notifications: {
        Row: {
          id: string
          userId: string
          title: string
          message: string
          read: boolean
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          userId: string
          title: string
          message: string
          read?: boolean
          type: string
          created_at?: string
        }
        Update: {
          id?: string
          userId?: string
          title?: string
          message?: string
          read?: boolean
          type?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}