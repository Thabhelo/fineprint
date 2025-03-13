/*
  # Fix Conversation History Schema

  1. Changes
    - Drops and recreates conversation_history table with proper structure
    - Ensures proper RLS policies
    - Adds necessary triggers

  2. Security
    - Enables RLS
    - Adds policies for authenticated users
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.conversation_history;

-- Create conversation history table
CREATE TABLE public.conversation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  messages jsonb[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own conversations" ON public.conversation_history;

-- Create policies
CREATE POLICY "Users can manage own conversations"
  ON public.conversation_history 
  FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_conversation_history_updated_at ON public.conversation_history;
CREATE TRIGGER update_conversation_history_updated_at
  BEFORE UPDATE ON public.conversation_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create index for faster lookups
CREATE INDEX conversation_history_user_id_idx ON public.conversation_history(user_id);
CREATE INDEX conversation_history_created_at_idx ON public.conversation_history(created_at DESC);