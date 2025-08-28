-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS trigger_update_car_like_count ON car_likes;
DROP FUNCTION IF EXISTS update_car_like_count();

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION update_car_like_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Add some debugging
    RAISE NOTICE 'Trigger fired: % on car_id %', TG_OP, COALESCE(NEW.car_id, OLD.car_id);
    
    IF TG_OP = 'INSERT' THEN
        UPDATE cars SET like_count = like_count + 1 WHERE id = NEW.car_id;
        RAISE NOTICE 'Incremented like_count for car %', NEW.car_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE cars SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.car_id;
        RAISE NOTICE 'Decremented like_count for car %', OLD.car_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_update_car_like_count
    AFTER INSERT OR DELETE ON car_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_car_like_count();

-- Manually update all existing like counts
UPDATE cars SET like_count = (
    SELECT COUNT(*) FROM car_likes WHERE car_id = cars.id
);

-- Verify the trigger is working by checking a few cars
SELECT 
    c.id,
    c.name,
    c.like_count,
    (SELECT COUNT(*) FROM car_likes WHERE car_id = c.id) as actual_likes
FROM cars c
WHERE c.like_count > 0 OR EXISTS (SELECT 1 FROM car_likes WHERE car_id = c.id);
