-- Add unit_preference field to profiles table
ALTER TABLE profiles 
ADD COLUMN unit_preference TEXT DEFAULT 'metric' CHECK (unit_preference IN ('metric', 'imperial'));

-- Update existing profiles to use metric as default
UPDATE profiles SET unit_preference = 'metric' WHERE unit_preference IS NULL;
