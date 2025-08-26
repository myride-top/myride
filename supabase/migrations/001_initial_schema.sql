-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cars table with detailed specifications
CREATE TABLE IF NOT EXISTS cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  description TEXT,
  
  -- Engine Specifications
  engine_displacement DECIMAL(4,1), -- in liters (e.g., 2.0, 3.5)
  engine_cylinders INTEGER, -- number of cylinders
  horsepower INTEGER, -- in HP
  torque INTEGER, -- in lb-ft
  engine_type TEXT, -- e.g., "Turbocharged I4", "Naturally Aspirated V8"
  fuel_type TEXT, -- e.g., "Gasoline", "Diesel", "Hybrid", "Electric"
  transmission TEXT, -- e.g., "6-Speed Manual", "8-Speed Automatic"
  
  -- Performance Specifications
  zero_to_sixty DECIMAL(3,1), -- 0-60 mph time in seconds
  top_speed INTEGER, -- in mph
  quarter_mile DECIMAL(4,1), -- quarter mile time in seconds
  
  -- Brake System
  front_brakes TEXT, -- e.g., "Brembo 4-Piston Calipers"
  rear_brakes TEXT, -- e.g., "Single Piston Calipers"
  brake_rotors TEXT, -- e.g., "Vented Discs"
  
  -- Suspension
  front_suspension TEXT, -- e.g., "MacPherson Struts"
  rear_suspension TEXT, -- e.g., "Multi-Link"
  suspension_type TEXT, -- e.g., "Coilovers", "Air Suspension"
  ride_height TEXT, -- e.g., "Lowered 2 inches"
  
  -- Wheels and Tires
  wheel_size TEXT, -- e.g., "18x8.5"
  wheel_material TEXT, -- e.g., "Forged Aluminum", "Carbon Fiber"
  wheel_brand TEXT, -- e.g., "BBS", "Volk", "OEM"
  tire_size TEXT, -- e.g., "245/40R18"
  tire_brand TEXT, -- e.g., "Michelin", "Bridgestone"
  
  -- Exterior
  body_kit TEXT, -- e.g., "M Sport Package", "Custom Widebody"
  paint_color TEXT, -- e.g., "Alpine White", "Metallic Blue"
  paint_type TEXT, -- e.g., "Pearl", "Matte", "Gloss"
  
  -- Interior
  interior_color TEXT, -- e.g., "Black", "Tan"
  interior_material TEXT, -- e.g., "Leather", "Alcantara"
  seats TEXT, -- e.g., "Sport Buckets", "Recaro"
  
  -- Modifications
  modifications TEXT[], -- array of modification descriptions
  dyno_results TEXT, -- e.g., "350 WHP on Dynojet"
  
  -- Photo organization
  photos JSONB DEFAULT '[]'::jsonb, -- array of photo objects with categories
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cars_user_id ON cars(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for cars
CREATE POLICY "Users can view all cars" ON cars
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own cars" ON cars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cars" ON cars
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cars" ON cars
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to generate unique username
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
$$ LANGUAGE plpgsql;

-- Create function to handle user creation
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
  
  INSERT INTO profiles (id, username, full_name)
  VALUES (
    NEW.id,
    username,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
