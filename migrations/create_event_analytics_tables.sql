-- Create event_views table
CREATE TABLE IF NOT EXISTS event_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_shares table
CREATE TABLE IF NOT EXISTS event_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  share_platform TEXT NOT NULL CHECK (share_platform IN ('twitter', 'facebook', 'instagram', 'whatsapp', 'telegram', 'copy_link', 'other')),
  share_url TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_views_event_id ON event_views(event_id);
CREATE INDEX IF NOT EXISTS idx_event_views_user_id ON event_views(user_id);
CREATE INDEX IF NOT EXISTS idx_event_views_created_at ON event_views(created_at);
CREATE INDEX IF NOT EXISTS idx_event_shares_event_id ON event_shares(event_id);
CREATE INDEX IF NOT EXISTS idx_event_shares_user_id ON event_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_event_shares_created_at ON event_shares(created_at);

-- Add RLS policies
ALTER TABLE event_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert event views (for analytics)
CREATE POLICY "Anyone can insert event views" ON event_views
  FOR INSERT WITH CHECK (true);

-- Policy: Event creators can view views for their events
CREATE POLICY "Event creators can view their event views" ON event_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_views.event_id 
      AND events.created_by = auth.uid()
    )
  );

-- Policy: Anyone can insert event shares (for analytics)
CREATE POLICY "Anyone can insert event shares" ON event_shares
  FOR INSERT WITH CHECK (true);

-- Policy: Event creators can view shares for their events
CREATE POLICY "Event creators can view their event shares" ON event_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_shares.event_id 
      AND events.created_by = auth.uid()
    )
  );

