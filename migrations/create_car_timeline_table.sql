-- Create car_timeline table
-- This table stores timeline entries for car builds, allowing users to document their build process with dates, titles, descriptions, and photos

CREATE TABLE IF NOT EXISTS car_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_car_timeline_car_id ON car_timeline(car_id);
CREATE INDEX IF NOT EXISTS idx_car_timeline_date ON car_timeline(date);
CREATE INDEX IF NOT EXISTS idx_car_timeline_order ON car_timeline(car_id, order_index);

-- Add RLS policies
ALTER TABLE car_timeline ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view timeline entries
CREATE POLICY "Anyone can view car timeline" ON car_timeline
  FOR SELECT USING (true);

-- Policy: Users can insert timeline entries for their own cars
CREATE POLICY "Users can insert timeline for their cars" ON car_timeline
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cars 
      WHERE cars.id = car_timeline.car_id 
      AND cars.user_id = auth.uid()
    )
  );

-- Policy: Users can update timeline entries for their own cars
CREATE POLICY "Users can update timeline for their cars" ON car_timeline
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cars 
      WHERE cars.id = car_timeline.car_id 
      AND cars.user_id = auth.uid()
    )
  );

-- Policy: Users can delete timeline entries for their own cars
CREATE POLICY "Users can delete timeline for their cars" ON car_timeline
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM cars 
      WHERE cars.id = car_timeline.car_id 
      AND cars.user_id = auth.uid()
    )
  );

-- Add comments for documentation
COMMENT ON TABLE car_timeline IS 'Timeline entries for car builds documenting the build process';
COMMENT ON COLUMN car_timeline.date IS 'Date of the timeline entry';
COMMENT ON COLUMN car_timeline.title IS 'Title of the timeline entry';
COMMENT ON COLUMN car_timeline.description IS 'Detailed description of what happened on this date';
COMMENT ON COLUMN car_timeline.photo_url IS 'Optional photo URL for this timeline entry';
COMMENT ON COLUMN car_timeline.order_index IS 'Order index for sorting timeline entries (lower numbers appear first)';

