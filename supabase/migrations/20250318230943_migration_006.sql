-- Create conversation_history table 
CREATE TABLE IF NOT EXISTS public.conversation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now() 
);

-- Add GIN index for faster JSONB queries 
CREATE INDEX IF NOT EXISTS conversation_messages_gin ON public.conversation_history USING GIN (messages);

-- Enable Row Level Security 
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own conversations 
CREATE POLICY "Users can manage own conversations"
  ON public.conversation_history 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Create the function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger for conversation history 
CREATE TRIGGER update_conversation_history_updated_at
  BEFORE UPDATE ON public.conversation_history 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();