-- Create car_likes table to track user likes
CREATE TABLE car_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, car_id)
);

-- Create index for better query performance
CREATE INDEX idx_car_likes_user_id ON car_likes(user_id);
CREATE INDEX idx_car_likes_car_id ON car_likes(car_id);

-- Add like_count column to cars table for caching
ALTER TABLE cars ADD COLUMN like_count INTEGER DEFAULT 0;

-- Create function to update like count
CREATE OR REPLACE FUNCTION update_car_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE cars SET like_count = like_count + 1 WHERE id = NEW.car_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE cars SET like_count = like_count - 1 WHERE id = OLD.car_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update like count
CREATE TRIGGER trigger_update_car_like_count
    AFTER INSERT OR DELETE ON car_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_car_like_count();

-- Initialize like_count for existing cars
UPDATE cars SET like_count = (
    SELECT COUNT(*) FROM car_likes WHERE car_id = cars.id
);
