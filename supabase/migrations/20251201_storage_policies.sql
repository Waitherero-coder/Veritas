/*
  # Storage Bucket and Policies for Evidence Files
  
  This migration creates the 'evidence' storage bucket and sets up
  Row Level Security policies to ensure users can only access
  files from their own cases.
*/

-- Create the evidence storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this migration)
DROP POLICY IF EXISTS "Users can upload evidence to own cases" ON storage.objects;
DROP POLICY IF EXISTS "Users can read evidence from own cases" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete evidence from own cases" ON storage.objects;

-- Allow authenticated users to upload files to their own case folders
CREATE POLICY "Users can upload evidence to own cases"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'evidence' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM case_files WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to read files from their own cases
CREATE POLICY "Users can read evidence from own cases"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'evidence' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM case_files WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to delete files from their own cases
CREATE POLICY "Users can delete evidence from own cases"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'evidence' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM case_files WHERE user_id = auth.uid()
  )
);