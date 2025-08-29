-- Fix RLS Performance Issues
-- This migration addresses the Performance Advisor warnings and suggestions

-- Drop duplicate and conflicting policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow public to view profiles" ON profiles;

DROP POLICY IF EXISTS "Users can view all cars" ON cars;
DROP POLICY IF EXISTS "Users can insert their own cars" ON cars;
DROP POLICY IF EXISTS "Users can update their own cars" ON cars;
DROP POLICY IF EXISTS "Users can delete their own cars" ON cars;

-- Create optimized RLS policies for profiles
-- Use a single consolidated policy for SELECT that handles both own profile and public viewing
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    true  -- Allow public viewing for car detail pages
  );

-- Separate policies for other operations
CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create optimized RLS policies for cars
CREATE POLICY "cars_select_policy" ON cars
  FOR SELECT USING (true);  -- Allow public viewing of all cars

CREATE POLICY "cars_insert_policy" ON cars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cars_update_policy" ON cars
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cars_delete_policy" ON cars
  FOR DELETE USING (auth.uid() = user_id);

-- Check for unused indexes and drop them if they exist
-- Note: Only drop indexes that are confirmed to be unused
-- The Performance Advisor suggests these might be unused:
-- - Any indexes on public.cars that aren't being used
-- - Any indexes on public.car_likes that aren't being used

-- Let's check what indexes exist first
-- This is a comment section for manual verification:
/*
To check for unused indexes, run these queries in your Supabase dashboard:

-- Check all indexes on cars table
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'cars' AND schemaname = 'public';

-- Check all indexes on car_likes table (if it exists)
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'car_likes' AND schemaname = 'public';

-- Check index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename IN ('cars', 'car_likes')
ORDER BY idx_scan DESC;
*/

-- If you find unused indexes, you can drop them with:
-- DROP INDEX IF EXISTS index_name_here;
