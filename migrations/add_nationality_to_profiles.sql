-- Add nationality column to profiles table
-- This column stores the user's nationality as a country code (ISO 3166-1 alpha-2)

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS nationality TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.nationality IS 'User nationality (ISO 3166-1 alpha-2 country code)';

