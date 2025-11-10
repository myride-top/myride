-- Add route field to events table for storing cruise routes
ALTER TABLE events
ADD COLUMN route JSONB;

-- Add comment to document route structure
COMMENT ON COLUMN events.route IS 'Array of [latitude, longitude] coordinates for cruise routes. Format: [[lat1, lng1], [lat2, lng2], ...]';

-- Create index for route queries (GIN index for JSONB)
CREATE INDEX IF NOT EXISTS idx_events_route ON events USING GIN (route);

