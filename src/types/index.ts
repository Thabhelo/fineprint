import type { Database } from '../lib/database.types';

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export type Contract = Database['public']['Tables']['contracts']['Row'] & {
  analysis_results: Array<{
    risk_level: string;
    analysis_issues?: Array<{
      id: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      created_at: string;
    }>;
  }>;
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'] & {
  full_name: string | null;
  company: string | null;
  role: string | null;
}