-- Add second photo URL column to car_timeline table
ALTER TABLE car_timeline
ADD COLUMN IF NOT EXISTS photo_url_2 TEXT;

-- Add comment for documentation
COMMENT ON COLUMN car_timeline.photo_url_2 IS 'Optional second photo URL for this timeline entry';

