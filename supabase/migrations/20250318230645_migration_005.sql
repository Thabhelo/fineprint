-- Enable RLS on contracts table
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own contracts
CREATE POLICY "Users can insert their own contracts"
ON contracts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to view their own contracts
CREATE POLICY "Users can view their own contracts"
ON contracts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to update their own contracts
CREATE POLICY "Users can update their own contracts"
ON contracts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own contracts
CREATE POLICY "Users can delete their own contracts"
ON contracts FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 