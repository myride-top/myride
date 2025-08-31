-- Premium Features Database Migration
-- This migration adds support for car views, shares, and comments

-- 1. Add new columns to cars table
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- 2. Create car_views table
CREATE TABLE IF NOT EXISTS car_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create car_shares table
CREATE TABLE IF NOT EXISTS car_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    share_platform TEXT NOT NULL CHECK (share_platform IN ('twitter', 'facebook', 'instagram', 'whatsapp', 'telegram', 'copy_link', 'other')),
    share_url TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create car_comments table
CREATE TABLE IF NOT EXISTS car_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES car_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_car_views_car_id ON car_views(car_id);
CREATE INDEX IF NOT EXISTS idx_car_views_user_id ON car_views(user_id);
CREATE INDEX IF NOT EXISTS idx_car_views_created_at ON car_views(created_at);

CREATE INDEX IF NOT EXISTS idx_car_shares_car_id ON car_shares(car_id);
CREATE INDEX IF NOT EXISTS idx_car_shares_user_id ON car_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_car_shares_platform ON car_shares(share_platform);
CREATE INDEX IF NOT EXISTS idx_car_shares_created_at ON car_shares(created_at);

CREATE INDEX IF NOT EXISTS idx_car_comments_car_id ON car_comments(car_id);
CREATE INDEX IF NOT EXISTS idx_car_comments_user_id ON car_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_car_comments_parent_id ON car_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_car_comments_created_at ON car_comments(created_at);

-- 6. Create RLS policies for security
ALTER TABLE car_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_comments ENABLE ROW LEVEL SECURITY;

-- Views: Anyone can view, authenticated users can insert their own views
CREATE POLICY "Anyone can view car views" ON car_views FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert views" ON car_views FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Shares: Anyone can view, authenticated users can insert their own shares
CREATE POLICY "Anyone can view car shares" ON car_shares FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert shares" ON car_shares FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Comments: Anyone can view, authenticated users can insert/edit their own comments
CREATE POLICY "Anyone can view car comments" ON car_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments" ON car_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own comments" ON car_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON car_comments FOR DELETE USING (auth.uid() = user_id);

-- 7. Create function to update car counts
CREATE OR REPLACE FUNCTION update_car_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'car_views' THEN
        UPDATE cars 
        SET view_count = (
            SELECT COUNT(*) FROM car_views cv 
            WHERE cv.car_id = NEW.car_id 
            AND NOT is_car_owner(cv.car_id, cv.user_id)
        )
        WHERE id = NEW.car_id;
        RETURN NEW;
    ELSIF TG_TABLE_NAME = 'car_shares' THEN
        UPDATE cars 
        SET share_count = (
            SELECT COUNT(*) FROM car_shares cs 
            WHERE cs.car_id = NEW.car_id 
            AND NOT is_car_owner(cs.car_id, cs.user_id)
        )
        WHERE id = NEW.car_id;
        RETURN NEW;
    ELSIF TG_TABLE_NAME = 'car_comments' THEN
        UPDATE cars 
        SET comment_count = (
            SELECT COUNT(*) FROM car_comments cc 
            WHERE cc.car_id = NEW.car_id 
            AND NOT is_car_owner(cc.car_id, cc.user_id)
        )
        WHERE id = NEW.car_id;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create triggers to automatically update car counts
CREATE TRIGGER trigger_update_car_view_count
    AFTER INSERT OR DELETE ON car_views
    FOR EACH ROW EXECUTE FUNCTION update_car_counts();

CREATE TRIGGER trigger_update_car_share_count
    AFTER INSERT OR DELETE ON car_shares
    FOR EACH ROW EXECUTE FUNCTION update_car_counts();

CREATE TRIGGER trigger_update_car_comment_count
    AFTER INSERT OR DELETE ON car_comments
    FOR EACH ROW EXECUTE FUNCTION update_car_counts();

-- 9. Update existing cars to have default counts
UPDATE cars SET 
    view_count = COALESCE(view_count, 0),
    share_count = COALESCE(share_count, 0),
    comment_count = COALESCE(comment_count, 0);

-- 12. Add anti-farming protection: prevent car owners from inflating their own stats
-- Create a function to check if user is car owner
CREATE OR REPLACE FUNCTION is_car_owner(car_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM cars 
        WHERE id = car_id AND user_id = user_id
    );
END;
$$ LANGUAGE plpgsql;

-- Update the count functions to exclude owner actions
CREATE OR REPLACE FUNCTION update_car_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'car_views' THEN
        UPDATE cars 
        SET view_count = (
            SELECT COUNT(*) FROM car_views cv 
            WHERE cv.car_id = NEW.car_id 
            AND NOT is_car_owner(cv.car_id, cv.user_id)
        )
        WHERE id = NEW.car_id;
        RETURN NEW;
    ELSIF TG_TABLE_NAME = 'car_shares' THEN
        UPDATE cars 
        SET share_count = (
            SELECT COUNT(*) FROM car_shares cs 
            WHERE cs.car_id = NEW.car_id 
            AND NOT is_car_owner(cs.car_id, cs.user_id)
        )
        WHERE id = NEW.car_id;
        RETURN NEW;
    ELSIF TG_TABLE_NAME = 'car_comments' THEN
        UPDATE cars 
        SET comment_count = (
            SELECT COUNT(*) FROM car_comments cc 
            WHERE cc.car_id = NEW.car_id 
            AND NOT is_car_owner(cc.car_id, cc.user_id)
        )
        WHERE id = NEW.car_id;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
