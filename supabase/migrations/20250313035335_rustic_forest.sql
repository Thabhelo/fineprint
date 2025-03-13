/*
  # Fix Auth Schema and User Creation

  1. Changes
    - Ensures auth schema exists
    - Creates auth.users table if not exists
    - Adds proper constraints and indexes
    - Updates user profile creation trigger
    - Adds proper error handling

  2. Security
    - Maintains RLS policies
    - Adds proper constraints
    - Handles concurrent operations safely
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

-- Create policy for users to read their own data
CREATE POLICY "Users can read own data"
  ON auth.users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Create policy for users to update their own data
CREATE POLICY "Users can update own data"
  ON auth.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users (email);

-- Create updated_at trigger for auth.users
CREATE TRIGGER set_auth_users_updated_at
  BEFORE UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_profile();

-- Add admin role to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type 
    WHERE typname = 'user_role'
  ) THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
    
    ALTER TABLE auth.users 
    ALTER COLUMN role TYPE user_role 
    USING role::user_role;
  END IF;
END $$;