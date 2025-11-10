-- Create storage bucket for event images
-- Note: This needs to be run in Supabase SQL Editor or via Supabase CLI
-- The bucket will be created with public access for reading images

-- Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for event-images bucket
-- Allow authenticated users to upload images for events they created
CREATE POLICY "Allow authenticated users to upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images' AND
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id::text = (storage.foldername(name))[1]
    AND events.created_by = auth.uid()
  )
);

-- Allow authenticated users to update images for events they created
CREATE POLICY "Allow authenticated users to update their own event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id::text = (storage.foldername(name))[1]
    AND events.created_by = auth.uid()
  )
);

-- Allow authenticated users to delete images for events they created
CREATE POLICY "Allow authenticated users to delete their own event images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id::text = (storage.foldername(name))[1]
    AND events.created_by = auth.uid()
  )
);

-- Allow public read access to event images
CREATE POLICY "Allow public read access to event images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

