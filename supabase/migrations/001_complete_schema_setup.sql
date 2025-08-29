-- Complete Schema Setup for MyRide
-- This migration consolidates all previous migrations into a single file
-- for setting up a new Supabase organization

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  unit_preference TEXT DEFAULT 'metric' CHECK (unit_preference IN ('metric', 'imperial')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cars table with comprehensive specifications
CREATE TABLE IF NOT EXISTS cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url_slug TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  description TEXT,
  
  -- Engine Specifications
  engine_displacement DECIMAL(4,1), -- in liters (e.g., 2.0, 3.5)
  engine_cylinders INTEGER, -- number of cylinders
  engine_code TEXT, -- e.g., "B58", "LS3", "K20"
  horsepower INTEGER, -- in HP
  torque INTEGER, -- in lb-ft
  engine_type TEXT, -- e.g., "Turbocharged I4", "Naturally Aspirated V8"
  fuel_type TEXT, -- e.g., "Gasoline", "Diesel", "Hybrid", "Electric"
  transmission TEXT, -- e.g., "6-Speed Manual", "8-Speed Automatic"
  drivetrain TEXT, -- e.g., "AWD", "RWD", "FWD"
  
  -- Performance Specifications
  zero_to_sixty DECIMAL(3,1), -- 0-60 mph time in seconds
  top_speed INTEGER, -- in mph
  quarter_mile DECIMAL(4,1), -- quarter mile time in seconds
  weight INTEGER, -- in lbs
  power_to_weight TEXT, -- e.g., "10.2 lbs/hp"
  
  -- Brake System
  front_brakes TEXT, -- e.g., "Brembo 4-Piston Calipers"
  rear_brakes TEXT, -- e.g., "Single Piston Calipers"
  brake_rotors TEXT, -- e.g., "Vented Discs"
  brake_caliper_brand TEXT, -- e.g., "Brembo", "Wilwood"
  brake_lines TEXT, -- e.g., "Stainless Steel Braided"
  
  -- Suspension
  front_suspension TEXT, -- e.g., "MacPherson Struts"
  rear_suspension TEXT, -- e.g., "Multi-Link"
  suspension_type TEXT, -- e.g., "Coilovers", "Air Suspension"
  ride_height TEXT, -- e.g., "Lowered 2 inches"
  coilovers TEXT, -- e.g., "KW V3", "Ohlins"
  sway_bars TEXT, -- e.g., "Eibach Front & Rear"
  
  -- Wheels and Tires
  wheel_size TEXT, -- e.g., "18x8.5"
  wheel_material TEXT, -- e.g., "Forged Aluminum", "Carbon Fiber"
  wheel_brand TEXT, -- e.g., "BBS", "Volk", "OEM"
  wheel_offset TEXT, -- e.g., "+35", "-10"
  
  -- Front Tires
  front_tire_size TEXT, -- e.g., "245/40R18"
  front_tire_brand TEXT, -- e.g., "Michelin", "Bridgestone"
  front_tire_model TEXT, -- e.g., "Pilot Sport 4S"
  front_tire_pressure INTEGER, -- in PSI
  
  -- Rear Tires
  rear_tire_size TEXT, -- e.g., "275/35R18"
  rear_tire_brand TEXT, -- e.g., "Michelin", "Bridgestone"
  rear_tire_model TEXT, -- e.g., "Pilot Sport 4S"
  rear_tire_pressure INTEGER, -- in PSI
  
  -- Exterior
  body_kit TEXT, -- e.g., "M Sport Package", "Custom Widebody"
  paint_color TEXT, -- e.g., "Alpine White", "Metallic Blue"
  paint_type TEXT, -- e.g., "Pearl", "Matte", "Gloss"
  wrap_color TEXT, -- e.g., "Satin Black", "Matte Blue"
  carbon_fiber_parts TEXT, -- e.g., "Hood, Roof, Trunk"
  lighting TEXT, -- e.g., "LED Headlights", "Custom Taillights"
  
  -- Interior
  interior_color TEXT, -- e.g., "Black", "Tan"
  interior_material TEXT, -- e.g., "Leather", "Alcantara"
  seats TEXT, -- e.g., "Sport Buckets", "Recaro"
  steering_wheel TEXT, -- e.g., "M Sport", "Custom"
  shift_knob TEXT, -- e.g., "Carbon Fiber", "Weighted"
  gauges TEXT, -- e.g., "Defi", "AEM"
  
  -- Modifications
  modifications TEXT[], -- array of modification descriptions
  dyno_results TEXT, -- e.g., "350 WHP on Dynojet"
  
  -- Additional Details
  vin TEXT, -- Vehicle Identification Number
  mileage INTEGER, -- Current mileage
  fuel_economy TEXT, -- e.g., "22 MPG City, 28 MPG Highway"
  maintenance_history TEXT, -- Maintenance notes
  
  -- Photo organization
  photos JSONB DEFAULT '[]'::jsonb, -- array of photo objects with categories
  main_photo_url TEXT, -- URL of the main/featured photo
  
  -- Like count
  like_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create car_likes table to track user likes
CREATE TABLE IF NOT EXISTS car_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, car_id)
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Cars indexes
CREATE INDEX IF NOT EXISTS idx_cars_user_id ON cars(user_id);
CREATE INDEX IF NOT EXISTS idx_cars_url_slug_user_id ON cars(url_slug, user_id);
CREATE INDEX IF NOT EXISTS idx_cars_make_model ON cars(make, model);
CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);

-- Car likes indexes
CREATE INDEX IF NOT EXISTS idx_car_likes_user_id ON car_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_car_likes_car_id ON car_likes(car_id);

-- Car limit constraint (enforces maximum of 1 car per user for free tier)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cars_user_limit ON cars (user_id) 
WHERE user_id IS NOT NULL;

-- =====================================================
-- 3. CREATE FUNCTIONS
-- =====================================================

-- Function to generate unique username
CREATE OR REPLACE FUNCTION generate_unique_username()
RETURNS TEXT AS $$
DECLARE
  username TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    username := 'user_' || floor(random() * 1000000)::TEXT;
    IF counter > 0 THEN
      username := username || '_' || counter;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.username = username) THEN
      RETURN username;
    END IF;
    
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to generate unique username with base
CREATE OR REPLACE FUNCTION generate_unique_username(base_username TEXT)
RETURNS TEXT AS $$
DECLARE
    new_username TEXT;
    counter INTEGER := 1;
BEGIN
    new_username := base_username;
    
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = new_username) LOOP
        new_username := base_username || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN new_username;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username TEXT;
BEGIN
  -- Get username from metadata or generate from email
  IF NEW.raw_user_meta_data->>'username' IS NOT NULL THEN
    username := generate_unique_username(NEW.raw_user_meta_data->>'username');
  ELSE
    -- Generate username from email (remove domain part)
    username := generate_unique_username(split_part(NEW.email, '@', 1));
  END IF;
  
  INSERT INTO profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    username,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to generate URL slugs from car names
CREATE OR REPLACE FUNCTION generate_url_slug(car_name TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Convert to lowercase, replace spaces and special characters with dashes
  -- Remove multiple dashes and trim
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(car_name, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to generate unique URL slugs
CREATE OR REPLACE FUNCTION generate_unique_url_slug(base_slug TEXT, user_id UUID)
RETURNS TEXT AS $$
DECLARE
  new_slug TEXT;
  counter INTEGER := 1;
BEGIN
  new_slug := base_slug;
  
  -- Keep trying until we find a unique slug for this user
  WHILE EXISTS (
    SELECT 1 FROM cars 
    WHERE url_slug = new_slug 
    AND cars.user_id = generate_unique_url_slug.user_id
  ) LOOP
    new_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to automatically generate url_slug when a car is created
CREATE OR REPLACE FUNCTION auto_generate_url_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if url_slug is not provided
  IF NEW.url_slug IS NULL OR NEW.url_slug = '' THEN
    NEW.url_slug := generate_unique_url_slug(
      generate_url_slug(NEW.name), 
      NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to update car like count
CREATE OR REPLACE FUNCTION update_car_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE cars SET like_count = like_count + 1 WHERE id = NEW.car_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE cars SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.car_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to get current user ID more efficiently
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 4. CREATE TRIGGERS
-- =====================================================

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically generate url_slug
CREATE TRIGGER trigger_auto_generate_url_slug
  BEFORE INSERT OR UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION auto_generate_url_slug();

-- Trigger to automatically update like count
CREATE TRIGGER trigger_update_car_like_count
    AFTER INSERT OR DELETE ON car_likes
    FOR EACH ROW EXECUTE FUNCTION update_car_like_count();

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_likes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES
-- =====================================================

-- Profiles policies
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

-- Cars policies
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

-- Car likes policies
CREATE POLICY "car_likes_select_policy" ON car_likes
  FOR SELECT USING (true);  -- Allow public viewing of likes

CREATE POLICY "car_likes_insert_policy" ON car_likes
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );

CREATE POLICY "car_likes_delete_policy" ON car_likes
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );

-- =====================================================
-- 7. CREATE STORAGE BUCKETS
-- =====================================================

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create cars storage bucket for car photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cars',
  'cars',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 8. CREATE STORAGE POLICIES
-- =====================================================

-- Avatar storage policies
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

-- Car photos storage policies
CREATE POLICY "Users can upload car photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their car photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'cars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their car photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view car photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'cars');

-- =====================================================
-- 9. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE profiles IS 'User profiles with authentication and preferences';
COMMENT ON TABLE cars IS 'Car specifications and details with comprehensive information';
COMMENT ON TABLE car_likes IS 'Car likes table to track user engagement';

COMMENT ON COLUMN cars.engine_code IS 'Engine code/designation (e.g., B58, LS3, K20)';
COMMENT ON COLUMN cars.drivetrain IS 'Drivetrain configuration (AWD, RWD, FWD)';
COMMENT ON COLUMN cars.weight IS 'Vehicle weight in pounds';
COMMENT ON COLUMN cars.power_to_weight IS 'Power to weight ratio (e.g., 10.2 lbs/hp)';
COMMENT ON COLUMN cars.brake_caliper_brand IS 'Brake caliper brand/manufacturer';
COMMENT ON COLUMN cars.brake_lines IS 'Brake line specifications';
COMMENT ON COLUMN cars.coilovers IS 'Coilover suspension details';
COMMENT ON COLUMN cars.sway_bars IS 'Sway bar specifications';
COMMENT ON COLUMN cars.wheel_offset IS 'Wheel offset measurement';
COMMENT ON COLUMN cars.front_tire_size IS 'Front tire size specification';
COMMENT ON COLUMN cars.front_tire_brand IS 'Front tire brand/manufacturer';
COMMENT ON COLUMN cars.front_tire_model IS 'Front tire model name';
COMMENT ON COLUMN cars.front_tire_pressure IS 'Front tire pressure in PSI';
COMMENT ON COLUMN cars.rear_tire_size IS 'Rear tire size specification';
COMMENT ON COLUMN cars.rear_tire_brand IS 'Rear tire brand/manufacturer';
COMMENT ON COLUMN cars.rear_tire_model IS 'Rear tire model name';
COMMENT ON COLUMN cars.rear_tire_pressure IS 'Rear tire pressure in PSI';
COMMENT ON COLUMN cars.wrap_color IS 'Vehicle wrap color if applicable';
COMMENT ON COLUMN cars.carbon_fiber_parts IS 'Carbon fiber components list';
COMMENT ON COLUMN cars.lighting IS 'Custom lighting modifications';
COMMENT ON COLUMN cars.steering_wheel IS 'Steering wheel specifications';
COMMENT ON COLUMN cars.shift_knob IS 'Shift knob details';
COMMENT ON COLUMN cars.gauges IS 'Custom gauge specifications';
COMMENT ON COLUMN cars.vin IS 'Vehicle Identification Number';
COMMENT ON COLUMN cars.mileage IS 'Current mileage';
COMMENT ON COLUMN cars.fuel_economy IS 'Fuel economy rating';
COMMENT ON COLUMN cars.maintenance_history IS 'Maintenance history notes';
COMMENT ON COLUMN cars.main_photo_url IS 'URL of the main/featured photo for the car';

COMMENT ON INDEX idx_cars_user_limit IS 'Unique index on user_id - enforces maximum of 1 car per user for free tier';

COMMENT ON POLICY "profiles_select_policy" ON profiles IS 'Optimized policy for profile viewing - allows public access and authenticated users to view their own profile';
COMMENT ON POLICY "profiles_insert_policy" ON profiles IS 'Optimized policy for profile creation - only authenticated users can create their own profile';
COMMENT ON POLICY "profiles_update_policy" ON profiles IS 'Optimized policy for profile updates - only authenticated users can update their own profile';

COMMENT ON POLICY "cars_select_policy" ON cars IS 'Optimized policy for car viewing - allows public access to all cars';
COMMENT ON POLICY "cars_insert_policy" ON cars IS 'Optimized policy for car creation - only authenticated users can create cars';
COMMENT ON POLICY "cars_update_policy" ON cars IS 'Optimized policy for car updates - only authenticated users can update their own cars';
COMMENT ON POLICY "cars_delete_policy" ON cars IS 'Optimized policy for car deletion - only authenticated users can delete their own cars';

COMMENT ON POLICY "car_likes_select_policy" ON car_likes IS 'Allow public viewing of car likes';
COMMENT ON POLICY "car_likes_insert_policy" ON car_likes IS 'Allow authenticated users to like cars';
COMMENT ON POLICY "car_likes_delete_policy" ON car_likes IS 'Allow users to unlike their own likes';

-- =====================================================
-- 10. INITIALIZE DATA (if needed)
-- =====================================================

-- Update existing profiles to use metric as default unit preference
UPDATE profiles SET unit_preference = 'metric' WHERE unit_preference IS NULL;

-- Initialize like_count for existing cars (if any)
UPDATE cars SET like_count = (
    SELECT COUNT(*) FROM car_likes WHERE car_id = cars.id
) WHERE like_count IS NULL;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- This migration sets up the complete MyRide database schema including:
-- - User profiles with unit preferences
-- - Comprehensive car specifications
-- - Car likes system with automatic counting
-- - URL slug generation for SEO-friendly URLs
-- - Row Level Security policies
-- - Storage buckets for avatars and car photos
-- - All necessary functions and triggers
-- - Performance-optimized indexes
