-- Create admin_logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  details JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for action lookups
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON public.admin_logs (action);

-- Enable Row Level Security
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Service role can manage logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Trigger function can insert logs" ON public.admin_logs;

-- Create RLS policies
CREATE POLICY "Authenticated users can read logs"
  ON public.admin_logs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Service role can manage logs"
  ON public.admin_logs FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Trigger function can insert logs"
  ON public.admin_logs FOR INSERT TO postgres
  WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_admin_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger for admin_logs
CREATE TRIGGER update_admin_logs_updated_at
  BEFORE UPDATE ON public.admin_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_logs_updated_at(); 