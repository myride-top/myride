-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  attending BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_car_id ON event_attendees(car_id);

-- Add RLS policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all events
CREATE POLICY "Users can view all events" ON events
  FOR SELECT USING (true);

-- Policy: Only premium users can create events
CREATE POLICY "Premium users can create events" ON events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_premium = true
    )
  );

-- Policy: Users can update their own events
CREATE POLICY "Users can update their own events" ON events
  FOR UPDATE USING (auth.uid() = created_by);

-- Policy: Users can delete their own events
CREATE POLICY "Users can delete their own events" ON events
  FOR DELETE USING (auth.uid() = created_by);

-- Policy: Users can view all event attendees
CREATE POLICY "Users can view all event attendees" ON event_attendees
  FOR SELECT USING (true);

-- Policy: Users can insert their own attendance
CREATE POLICY "Users can insert their own attendance" ON event_attendees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own attendance
CREATE POLICY "Users can update their own attendance" ON event_attendees
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own attendance
CREATE POLICY "Users can delete their own attendance" ON event_attendees
  FOR DELETE USING (auth.uid() = user_id);

