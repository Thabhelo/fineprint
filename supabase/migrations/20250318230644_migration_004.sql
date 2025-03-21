-- Add file_path column to contracts table
ALTER TABLE contracts ADD COLUMN file_path TEXT;

-- Update existing contracts to have a default file_path
UPDATE contracts SET file_path = 'legacy/' || id || '.txt' WHERE file_path IS NULL; 