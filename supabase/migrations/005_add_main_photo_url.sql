-- Add main_photo_url column to cars table
ALTER TABLE cars ADD COLUMN main_photo_url TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN cars.main_photo_url IS 'URL of the main/featured photo for the car';
