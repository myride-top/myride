-- Add premium-only garage customization fields to profiles table
-- This migration adds fields that allow premium users to customize their public garage/profile page
-- All columns are nullable to preserve existing data and allow non-premium users to have null values

-- Add bio column (longer bio/about section)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add location column (user's location)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add instagram_handle column (Instagram handle without @)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS instagram_handle TEXT;

-- Add youtube_channel column (YouTube channel URL or handle)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS youtube_channel TEXT;

-- Add website_url column (Personal website URL)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Add garage_description column (Brief description for garage page)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS garage_description TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.bio IS 'Bio/about section for premium users garage page';
COMMENT ON COLUMN profiles.location IS 'User location (e.g., "Los Angeles, CA")';
COMMENT ON COLUMN profiles.instagram_handle IS 'Instagram handle without @ symbol';
COMMENT ON COLUMN profiles.youtube_channel IS 'YouTube channel URL or handle';
COMMENT ON COLUMN profiles.website_url IS 'Personal website or portfolio URL';
COMMENT ON COLUMN profiles.garage_description IS 'Brief description shown at the top of premium user garage page';

