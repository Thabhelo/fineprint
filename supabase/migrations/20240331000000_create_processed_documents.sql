-- Create processed_documents table
CREATE TABLE IF NOT EXISTS processed_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_processed_documents_user_id ON processed_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_processed_documents_created_at ON processed_documents(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE processed_documents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own documents
CREATE POLICY "Users can only view their own documents"
    ON processed_documents
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own documents
CREATE POLICY "Users can insert their own documents"
    ON processed_documents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own documents
CREATE POLICY "Users can update their own documents"
    ON processed_documents
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own documents
CREATE POLICY "Users can delete their own documents"
    ON processed_documents
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_processed_documents_updated_at
    BEFORE UPDATE ON processed_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 