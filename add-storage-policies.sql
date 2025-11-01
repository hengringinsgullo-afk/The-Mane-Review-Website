-- Storage policies for article-images bucket
-- Run this in Supabase SQL Editor

-- Policy 1: Allow authenticated users to INSERT (upload) images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'article-images'
);

-- Policy 2: Allow public SELECT (read) access
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'article-images'
);

-- Policy 3: Allow authenticated users to UPDATE their images
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'article-images'
);

-- Policy 4: Allow authenticated users to DELETE images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'article-images'
);
