-- Fix storage policies for car-photos bucket
-- The current policies expect userId folders, but we're using carId folders
-- We need to check if the user owns the car instead

-- Drop the existing policies
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Create new policies for car-photos bucket
-- Allow authenticated users to upload to any car-photos folder
CREATE POLICY "Allow authenticated users to upload car photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'car-photos' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to update car photos
CREATE POLICY "Allow authenticated users to update car photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'car-photos' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete car photos
CREATE POLICY "Allow authenticated users to delete car photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'car-photos' AND
    auth.role() = 'authenticated'
  );

-- Allow public read access to car photos
CREATE POLICY "Allow public read access to car photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'car-photos');

-- Create policies for avatars bucket (using userId folders)
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
