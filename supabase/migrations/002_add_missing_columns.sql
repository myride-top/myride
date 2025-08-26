-- Migration 002: Add missing car specification columns and policies
-- This migration safely adds missing columns without conflicts

-- Add missing columns to existing cars table (only if they don't exist)
DO $$ 
BEGIN
    -- Engine Specifications
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'engine_displacement') THEN
        ALTER TABLE cars ADD COLUMN engine_displacement DECIMAL(4,1);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'engine_cylinders') THEN
        ALTER TABLE cars ADD COLUMN engine_cylinders INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'horsepower') THEN
        ALTER TABLE cars ADD COLUMN horsepower INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'torque') THEN
        ALTER TABLE cars ADD COLUMN torque INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'engine_type') THEN
        ALTER TABLE cars ADD COLUMN engine_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'fuel_type') THEN
        ALTER TABLE cars ADD COLUMN fuel_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'transmission') THEN
        ALTER TABLE cars ADD COLUMN transmission TEXT;
    END IF;
    
    -- Performance Specifications
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'zero_to_sixty') THEN
        ALTER TABLE cars ADD COLUMN zero_to_sixty DECIMAL(3,1);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'top_speed') THEN
        ALTER TABLE cars ADD COLUMN top_speed INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'quarter_mile') THEN
        ALTER TABLE cars ADD COLUMN quarter_mile DECIMAL(4,1);
    END IF;
    
    -- Brake System
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'front_brakes') THEN
        ALTER TABLE cars ADD COLUMN front_brakes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'rear_brakes') THEN
        ALTER TABLE cars ADD COLUMN rear_brakes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'brake_rotors') THEN
        ALTER TABLE cars ADD COLUMN brake_rotors TEXT;
    END IF;
    
    -- Suspension
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'front_suspension') THEN
        ALTER TABLE cars ADD COLUMN front_suspension TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'rear_suspension') THEN
        ALTER TABLE cars ADD COLUMN rear_suspension TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'suspension_type') THEN
        ALTER TABLE cars ADD COLUMN suspension_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'ride_height') THEN
        ALTER TABLE cars ADD COLUMN ride_height TEXT;
    END IF;
    
    -- Wheels and Tires
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'wheel_size') THEN
        ALTER TABLE cars ADD COLUMN wheel_size TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'wheel_material') THEN
        ALTER TABLE cars ADD COLUMN wheel_material TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'wheel_brand') THEN
        ALTER TABLE cars ADD COLUMN wheel_brand TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'tire_size') THEN
        ALTER TABLE cars ADD COLUMN tire_size TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'tire_brand') THEN
        ALTER TABLE cars ADD COLUMN tire_brand TEXT;
    END IF;
    
    -- Exterior
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'body_kit') THEN
        ALTER TABLE cars ADD COLUMN body_kit TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'paint_color') THEN
        ALTER TABLE cars ADD COLUMN paint_color TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'paint_type') THEN
        ALTER TABLE cars ADD COLUMN paint_type TEXT;
    END IF;
    
    -- Interior
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'interior_color') THEN
        ALTER TABLE cars ADD COLUMN interior_color TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'interior_material') THEN
        ALTER TABLE cars ADD COLUMN interior_material TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'seats') THEN
        ALTER TABLE cars ADD COLUMN seats TEXT;
    END IF;
    
    -- Modifications
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'modifications') THEN
        ALTER TABLE cars ADD COLUMN modifications TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'dyno_results') THEN
        ALTER TABLE cars ADD COLUMN dyno_results TEXT;
    END IF;
    
END $$;

-- Update photos column to JSONB if it's not already
DO $$
BEGIN
    -- Check if photos column exists and is not already JSONB
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'photos') THEN
        -- If photos column exists but is not JSONB, convert it
        IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'photos') != 'jsonb' THEN
            -- First, drop the default if it exists to avoid casting issues
            ALTER TABLE cars ALTER COLUMN photos DROP DEFAULT;
            
            -- Handle different column types safely
            IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'photos') = 'text[]' THEN
                -- Convert text array to JSONB array
                ALTER TABLE cars ALTER COLUMN photos TYPE JSONB USING 
                    CASE 
                        WHEN photos IS NULL THEN '[]'::jsonb
                        ELSE photos::jsonb
                    END;
            ELSIF (SELECT data_type FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'photos') = 'text' THEN
                -- Convert text to JSONB array
                ALTER TABLE cars ALTER COLUMN photos TYPE JSONB USING 
                    CASE 
                        WHEN photos IS NULL OR photos = '' THEN '[]'::jsonb
                        ELSE '[]'::jsonb
                    END;
            ELSE
                -- For other types, try to convert to JSONB
                ALTER TABLE cars ALTER COLUMN photos TYPE JSONB USING '[]'::jsonb;
            END IF;
            
            -- Now set the new default after conversion
            ALTER TABLE cars ALTER COLUMN photos SET DEFAULT '[]'::jsonb;
        ELSE
            -- If already JSONB, just ensure default is set
            ALTER TABLE cars ALTER COLUMN photos SET DEFAULT '[]'::jsonb;
        END IF;
    ELSE
        -- If photos column doesn't exist, create it
        ALTER TABLE cars ADD COLUMN photos JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cars_user_id') THEN
        CREATE INDEX idx_cars_user_id ON cars(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_username') THEN
        CREATE INDEX idx_profiles_username ON profiles(username);
    END IF;
END $$;

-- Enable Row Level Security (only if not already enabled)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true) THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cars' AND rowsecurity = true) THEN
        ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create RLS policies for profiles (only if they don't exist)
DO $$
BEGIN
    -- Users can view their own profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON profiles
            FOR SELECT USING (auth.uid() = id);
    END IF;
    
    -- Users can update their own profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON profiles
            FOR UPDATE USING (auth.uid() = id);
    END IF;
    
    -- Users can insert their own profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" ON profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    
    -- Allow public to view profiles (for car detail pages)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow public to view profiles') THEN
        CREATE POLICY "Allow public to view profiles" ON profiles
            FOR SELECT USING (true);
    END IF;
END $$;

-- Create RLS policies for cars (only if they don't exist)
DO $$
BEGIN
    -- Users can view all cars
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cars' AND policyname = 'Users can view all cars') THEN
        CREATE POLICY "Users can view all cars" ON cars
            FOR SELECT USING (true);
    END IF;
    
    -- Users can insert their own cars
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cars' AND policyname = 'Users can insert their own cars') THEN
        CREATE POLICY "Users can insert their own cars" ON cars
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    -- Users can update their own cars
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cars' AND policyname = 'Users can update their own cars') THEN
        CREATE POLICY "Users can update their own cars" ON cars
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    -- Users can delete their own cars
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cars' AND policyname = 'Users can delete their own cars') THEN
        CREATE POLICY "Users can delete their own cars" ON cars
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- Create or replace the generate_unique_username function
CREATE OR REPLACE FUNCTION public.generate_unique_username(base_username TEXT)
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
$$ LANGUAGE plpgsql;

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at
            BEFORE UPDATE ON profiles
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cars_updated_at') THEN
        CREATE TRIGGER update_cars_updated_at
            BEFORE UPDATE ON cars
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
