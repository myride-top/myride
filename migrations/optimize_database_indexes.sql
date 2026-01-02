-- Database Index Optimization for MyRide
-- These indexes will significantly improve query performance

-- Cars table indexes
CREATE INDEX IF NOT EXISTS idx_cars_user_id ON cars(user_id);
CREATE INDEX IF NOT EXISTS idx_cars_url_slug ON cars(url_slug);
CREATE INDEX IF NOT EXISTS idx_cars_user_slug ON cars(user_id, url_slug);
CREATE INDEX IF NOT EXISTS idx_cars_created_at ON cars(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cars_name ON cars(name);
CREATE INDEX IF NOT EXISTS idx_cars_make_model ON cars(make, model);

-- Car likes indexes
CREATE INDEX IF NOT EXISTS idx_car_likes_car_id ON car_likes(car_id);
CREATE INDEX IF NOT EXISTS idx_car_likes_user_id ON car_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_car_likes_car_user ON car_likes(car_id, user_id);

-- Car views indexes
CREATE INDEX IF NOT EXISTS idx_car_views_car_id ON car_views(car_id);
CREATE INDEX IF NOT EXISTS idx_car_views_created_at ON car_views(created_at DESC);

-- Car shares indexes
CREATE INDEX IF NOT EXISTS idx_car_shares_car_id ON car_shares(car_id);
CREATE INDEX IF NOT EXISTS idx_car_shares_created_at ON car_shares(created_at DESC);

-- Car comments indexes
CREATE INDEX IF NOT EXISTS idx_car_comments_car_id ON car_comments(car_id);
CREATE INDEX IF NOT EXISTS idx_car_comments_user_id ON car_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_car_comments_parent ON car_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_car_comments_created_at ON car_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_car_comments_car_pinned ON car_comments(car_id, is_pinned DESC, created_at ASC);

-- Comment likes indexes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_user ON comment_likes(comment_id, user_id);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium) WHERE is_premium = true;

-- Events indexes
-- Note: events table uses 'created_by' not 'user_id'
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
-- Location index already exists in create_events_tables.sql on (latitude, longitude)
-- Route index already exists in add_event_route.sql as GIN index on route JSONB column
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON events(end_date) WHERE end_date IS NOT NULL;

-- Event attendees indexes
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);

-- Event views indexes
CREATE INDEX IF NOT EXISTS idx_event_views_event_id ON event_views(event_id);

-- Event shares indexes
CREATE INDEX IF NOT EXISTS idx_event_shares_event_id ON event_shares(event_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_cars_user_created ON cars(user_id, created_at DESC);
-- Note: INCLUDE clause requires PostgreSQL 11+, use composite index if not available
CREATE INDEX IF NOT EXISTS idx_car_likes_car_user ON car_likes(car_id, user_id);

-- Analyze tables after creating indexes for query planner optimization
ANALYZE cars;
ANALYZE car_likes;
ANALYZE car_views;
ANALYZE car_shares;
ANALYZE car_comments;
ANALYZE comment_likes;
ANALYZE profiles;
ANALYZE events;
ANALYZE event_attendees;
ANALYZE event_views;
ANALYZE event_shares;

