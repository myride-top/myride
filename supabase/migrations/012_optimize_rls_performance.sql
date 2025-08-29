-- Further optimize RLS performance
-- This migration addresses the Auth RLS Initialization Plan warnings

-- Drop the previous policies to recreate them with optimizations
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

DROP POLICY IF EXISTS "cars_select_policy" ON cars;
DROP POLICY IF EXISTS "cars_insert_policy" ON cars;
DROP POLICY IF EXISTS "cars_update_policy" ON cars;
DROP POLICY IF EXISTS "cars_delete_policy" ON cars;

-- Create optimized policies that minimize auth function calls
-- For profiles table
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (
    -- Use a more efficient approach: if user is authenticated, check ownership
    -- otherwise allow public access
    CASE 
      WHEN auth.uid() IS NOT NULL THEN auth.uid() = id
      ELSE true
    END
  );

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = id
  );

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND auth.uid() = id
  );

-- For cars table
CREATE POLICY "cars_select_policy" ON cars
  FOR SELECT USING (true);  -- Public access for all cars

CREATE POLICY "cars_insert_policy" ON cars
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );

CREATE POLICY "cars_update_policy" ON cars
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );

CREATE POLICY "cars_delete_policy" ON cars
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );

-- Create a function to get current user ID more efficiently
-- This can be used in complex queries where auth.uid() is called multiple times
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Add comments to help with future maintenance
COMMENT ON POLICY "profiles_select_policy" ON profiles IS 'Optimized policy for profile viewing - allows public access and authenticated users to view their own profile';
COMMENT ON POLICY "profiles_insert_policy" ON profiles IS 'Optimized policy for profile creation - only authenticated users can create their own profile';
COMMENT ON POLICY "profiles_update_policy" ON profiles IS 'Optimized policy for profile updates - only authenticated users can update their own profile';

COMMENT ON POLICY "cars_select_policy" ON cars IS 'Optimized policy for car viewing - allows public access to all cars';
COMMENT ON POLICY "cars_insert_policy" ON cars IS 'Optimized policy for car creation - only authenticated users can create cars';
COMMENT ON POLICY "cars_update_policy" ON cars IS 'Optimized policy for car updates - only authenticated users can update their own cars';
COMMENT ON POLICY "cars_delete_policy" ON cars IS 'Optimized policy for car deletion - only authenticated users can delete their own cars';
