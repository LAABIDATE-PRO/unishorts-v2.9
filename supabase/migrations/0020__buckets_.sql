-- Create storage bucket for thumbnails if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for videos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Thumbnails are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Videos are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- RLS Policies for thumbnails bucket
CREATE POLICY "Thumbnails are publicly viewable"
ON storage.objects FOR SELECT
USING ( bucket_id = 'thumbnails' );

CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'thumbnails' );

CREATE POLICY "Users can update their own thumbnails"
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner AND bucket_id = 'thumbnails' );

CREATE POLICY "Users can delete their own thumbnails"
ON storage.objects FOR DELETE
USING ( auth.uid() = owner AND bucket_id = 'thumbnails' );

-- RLS Policies for videos bucket
CREATE POLICY "Videos are publicly viewable"
ON storage.objects FOR SELECT
USING ( bucket_id = 'videos' );

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'videos' );

CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner AND bucket_id = 'videos' );

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING ( auth.uid() = owner AND bucket_id = 'videos' );

-- RLS Policies for avatars bucket
CREATE POLICY "Avatars are publicly viewable"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner AND bucket_id = 'avatars' );

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING ( auth.uid() = owner AND bucket_id = 'avatars' );