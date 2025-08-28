-- Add constraint to limit users to 1 car maximum
-- This creates a unique partial index that only applies when cars exist for a user
CREATE UNIQUE INDEX IF NOT EXISTS idx_cars_user_limit ON cars (user_id) 
WHERE user_id IS NOT NULL;

-- Add comment to explain the constraint
COMMENT ON INDEX idx_cars_user_limit IS 'Enforces maximum of 1 car per user';
