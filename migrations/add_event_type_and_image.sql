-- Add event_type and event_image_url columns to events table
ALTER TABLE events
ADD COLUMN event_type TEXT DEFAULT 'meetup',
ADD COLUMN event_image_url TEXT;

-- Create index for event_type
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);

-- Add comment to document event types
COMMENT ON COLUMN events.event_type IS 'Type of event: meetup, race, show, cruise, track_day, other';

