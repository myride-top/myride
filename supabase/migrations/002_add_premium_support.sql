-- Add premium user support to profiles table
-- This migration adds fields to track premium status and payment information

-- Add premium-related columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_purchased_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.is_premium IS 'Whether the user has premium access';
COMMENT ON COLUMN profiles.premium_purchased_at IS 'When the user purchased premium';
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for payment tracking';
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'Stripe subscription ID (for future use)';

-- Create index for premium users
CREATE INDEX IF NOT EXISTS idx_profiles_premium ON profiles(is_premium);

-- Create function to activate premium user
CREATE OR REPLACE FUNCTION activate_premium_user(user_id UUID, stripe_customer_id TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles 
  SET 
    is_premium = true,
    premium_purchased_at = NOW(),
    stripe_customer_id = COALESCE(stripe_customer_id, profiles.stripe_customer_id)
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to deactivate premium user
CREATE OR REPLACE FUNCTION deactivate_premium_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles 
  SET 
    is_premium = false,
    stripe_subscription_id = NULL
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to check if user can create more cars
CREATE OR REPLACE FUNCTION can_user_create_car(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_is_premium BOOLEAN;
  car_count INTEGER;
BEGIN
  -- Check if user is premium
  SELECT is_premium INTO user_is_premium
  FROM profiles 
  WHERE id = user_id;
  
  -- If premium, they can create unlimited cars
  IF user_is_premium THEN
    RETURN true;
  END IF;
  
  -- If not premium, check car count
  SELECT COUNT(*) INTO car_count
  FROM cars 
  WHERE cars.user_id = can_user_create_car.user_id;
  
  -- Free users can only have 1 car
  RETURN car_count < 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add comments for functions
COMMENT ON FUNCTION activate_premium_user IS 'Activates premium status for a user';
COMMENT ON FUNCTION deactivate_premium_user IS 'Deactivates premium status for a user';
COMMENT ON FUNCTION can_user_create_car IS 'Checks if a user can create a new car based on premium status and current car count';

-- Create a view for premium user statistics
CREATE OR REPLACE VIEW premium_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE is_premium = true) as premium_users,
  COUNT(*) FILTER (WHERE is_premium = false) as free_users,
  ROUND(
    (COUNT(*) FILTER (WHERE is_premium = true)::DECIMAL / COUNT(*)) * 100, 
    2
  ) as premium_conversion_rate
FROM profiles;

COMMENT ON VIEW premium_stats IS 'View for premium user statistics and conversion rates';
