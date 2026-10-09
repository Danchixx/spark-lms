-- ========================================================
-- Create 'lesson-files' Storage Bucket and Access Policies
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/uavnzrkcnavkqysiqjvm/sql)
-- ========================================================

-- 1. Create bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-files',
  'lesson-files',
  true,
  26214400, -- 25 MB in bytes
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 26214400;

-- 2. Drop existing policies if any to avoid duplicates
DROP POLICY IF EXISTS "Public Access to lesson-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to lesson-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update lesson-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from lesson-files" ON storage.objects;

-- 3. Policy: Public read access
CREATE POLICY "Public Access to lesson-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-files');

-- 4. Policy: Anyone logged in (or using anon key) can upload lesson documents
CREATE POLICY "Authenticated users can upload to lesson-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lesson-files');

-- 5. Policy: Allow updates/overwrites
CREATE POLICY "Authenticated users can update lesson-files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'lesson-files');

-- 6. Policy: Allow file deletions
CREATE POLICY "Authenticated users can delete from lesson-files"
ON storage.objects FOR DELETE
USING (bucket_id = 'lesson-files');
