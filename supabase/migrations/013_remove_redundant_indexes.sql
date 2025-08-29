-- Remove redundant indexes identified by performance analysis
-- This migration removes indexes that are redundant or unused

-- Remove redundant index on cars.user_id
-- The UNIQUE index idx_cars_user_limit already covers the functionality of idx_cars_user_id
DROP INDEX IF EXISTS idx_cars_user_id;

-- Add comment to document the removal
COMMENT ON INDEX idx_cars_user_limit IS 'Unique index on user_id - replaces redundant idx_cars_user_id index';

-- Note: If you find other unused indexes from the analysis script, add them here:
-- DROP INDEX IF EXISTS index_name_here;
