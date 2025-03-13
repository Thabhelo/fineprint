/*
  # Complete Database Schema

  1. Functions
    - Update timestamps
    - Handle new user registration
    - Create user profile
    - Create user settings

  2. Tables
    - user_profiles
    - user_settings
    - contracts
    - analysis_results
    - analysis_issues
    - user_notifications
    - admin_logs
    - usage_stats

  3. Security
    - RLS policies for all tables
    - Triggers for timestamps and user creation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create update_updated_at function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  company text,
  role text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  notification_frequency text DEFAULT 'daily',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  title text NOT NULL,
  url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create analysis_results table
CREATE TABLE IF NOT EXISTS public.analysis_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE,
  risk_level text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create analysis_issues table
CREATE TABLE IF NOT EXISTS public.analysis_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid REFERENCES public.analysis_results(id) ON DELETE CASCADE,
  severity text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_notifications table
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create usage_stats table
CREATE TABLE IF NOT EXISTS public.usage_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  contracts_analyzed integer DEFAULT 0,
  total_words_analyzed integer DEFAULT 0,
  high_risk_detected integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- User Profiles
CREATE POLICY IF NOT EXISTS "Users can insert own profile"
  ON public.user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can read own profile"
  ON public.user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON public.user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Settings
CREATE POLICY IF NOT EXISTS "Users can manage own settings"
  ON public.user_settings FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Contracts
CREATE POLICY IF NOT EXISTS "Users can manage own contracts"
  ON public.contracts FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Analysis Results
CREATE POLICY IF NOT EXISTS "Users can view own analysis results"
  ON public.analysis_results FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_id
    AND contracts.user_id = auth.uid()
  ));

-- Analysis Issues
CREATE POLICY IF NOT EXISTS "Users can view own analysis issues"
  ON public.analysis_issues FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.analysis_results ar
    JOIN public.contracts c ON c.id = ar.contract_id
    WHERE ar.id = analysis_id
    AND c.user_id = auth.uid()
  ));

-- User Notifications
CREATE POLICY IF NOT EXISTS "Users can manage own notifications"
  ON public.user_notifications FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin Logs
CREATE POLICY IF NOT EXISTS "Only admins can access logs"
  ON public.admin_logs FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));

-- Usage Stats
CREATE POLICY IF NOT EXISTS "Users can manage own stats"
  ON public.usage_stats FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create Triggers
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.usage_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_usage_stats_updated_at
  BEFORE UPDATE ON public.usage_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_profile();