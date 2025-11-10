-- Add end_date column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- Update index to include end_date for better query performance
CREATE INDEX IF NOT EXISTS idx_events_date_range ON events(event_date, end_date);

-- Add comment for documentation
COMMENT ON COLUMN events.end_date IS 'Optional end date and time for the event. If null, event is considered a single point in time.';

