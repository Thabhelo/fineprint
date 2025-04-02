-- Create processed_documents table
CREATE TABLE IF NOT EXISTS public.processed_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    file_name TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Grant access to authenticated users
GRANT ALL ON public.processed_documents TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.processed_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own documents" ON public.processed_documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.processed_documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.processed_documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.processed_documents;

-- Create policies
CREATE POLICY "Users can view their own documents"
    ON public.processed_documents
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
    ON public.processed_documents
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
    ON public.processed_documents
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
    ON public.processed_documents
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO authenticated;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.processed_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 