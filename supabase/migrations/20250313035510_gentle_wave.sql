/*
  # Fix Auth Schema and Policies

  1. Changes
    - Creates auth schema and users table
    - Drops all dependent policies before altering role type
    - Creates user role enum type
    - Updates role column type
    - Re-creates all policies with new role type

  2. Security
    - Enables RLS on users table
    - Re-establishes all security policies
*/

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create auth.users table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  encrypted_password text,
  email_confirmed_at timestamptz,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Drop ALL dependent policies that reference the role column
DROP POLICY IF EXISTS "Only admins can access logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins can read logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Users can read own data" ON auth.users;
DROP POLICY IF EXISTS "Users can update own data" ON auth.users;

-- Create user role type and update column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type 
    WHERE typname = 'user_role'
  ) THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
    
    -- Update existing rows to ensure valid enum values
    UPDATE auth.users SET role = 'user' WHERE role NOT IN ('user', 'admin');
    
    -- Alter column type
    ALTER TABLE auth.users 
    ALTER COLUMN role TYPE user_role 
    USING CASE 
      WHEN role = 'admin' THEN 'admin'::user_role 
      ELSE 'user'::user_role 
    END;
  END IF;
END $$;

-- Re-create admin logs policies with new role type
CREATE POLICY "Only admins can access logs"
  ON public.admin_logs FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'::user_role
  ));

CREATE POLICY "Admins can read logs"
  ON public.admin_logs FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'::user_role
  ));

-- Re-create auth user policies
CREATE POLICY "Users can read own data"
  ON auth.users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own data"
  ON auth.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users (email);

-- Create updated_at trigger for auth.users
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS set_auth_users_updated_at ON auth.users;
  CREATE TRIGGER set_auth_users_updated_at
    BEFORE UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
EXCEPTION 
  WHEN undefined_object THEN 
    NULL;
END $$;

-- Update user profile creation function to handle errors
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS trigger AS $$
BEGIN
  -- Create user profile
  BEGIN
    INSERT INTO public.user_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
  END;

  -- Create user settings
  BEGIN
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating user settings: %', SQLERRM;
  END;

  -- Create usage stats
  BEGIN
    INSERT INTO public.usage_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating usage stats: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger for new user registration
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_user_profile();
EXCEPTION 
  WHEN undefined_object THEN 
    NULL;
END $$;