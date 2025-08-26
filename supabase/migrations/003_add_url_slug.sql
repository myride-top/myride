-- Migration 003: Add url_slug field to cars table
-- This adds a dedicated URL field that can be auto-generated or customized

-- Add url_slug column to cars table
ALTER TABLE cars ADD COLUMN IF NOT EXISTS url_slug TEXT;

-- Create a function to generate URL slugs from car names
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
$$ LANGUAGE plpgsql;

-- Create a function to generate unique URL slugs
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
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate url_slug when a car is created
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
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_auto_generate_url_slug ON cars;
CREATE TRIGGER trigger_auto_generate_url_slug
  BEFORE INSERT OR UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION auto_generate_url_slug();

-- Create an index for better performance on url_slug lookups
CREATE INDEX IF NOT EXISTS idx_cars_url_slug_user_id ON cars(url_slug, user_id);

-- Update existing cars to have url_slugs
UPDATE cars 
SET url_slug = generate_unique_url_slug(
  generate_url_slug(name), 
  user_id
)
WHERE url_slug IS NULL OR url_slug = '';

-- Make url_slug NOT NULL after populating existing records
ALTER TABLE cars ALTER COLUMN url_slug SET NOT NULL;
