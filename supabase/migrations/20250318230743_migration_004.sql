-- Create contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Create policy for contracts
CREATE POLICY "Users can manage own contracts"
  ON public.contracts FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create analysis_results table
CREATE TABLE IF NOT EXISTS public.analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analysis results"
  ON public.analysis_results FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.contracts
    WHERE contracts.id = contract_id
    AND contracts.user_id = auth.uid()
  ));

-- Create analysis_issues table
CREATE TABLE IF NOT EXISTS public.analysis_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.analysis_results(id) ON DELETE CASCADE,
  severity TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.analysis_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analysis issues"
  ON public.analysis_issues FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.analysis_results ar
    JOIN public.contracts c ON c.id = ar.contract_id
    WHERE ar.id = analysis_id
    AND c.user_id = auth.uid()
  ));
