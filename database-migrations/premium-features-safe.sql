-- Premium Features Database Migration (Safe Version)
-- This migration safely adds support for car views, shares, and comments
-- It checks for existing objects before creating them

-- 1. Add new columns to cars table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'view_count') THEN
        ALTER TABLE cars ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'share_count') THEN
        ALTER TABLE cars ADD COLUMN share_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'comment_count') THEN
        ALTER TABLE cars ADD COLUMN comment_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Create car_views table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS car_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create car_shares table (only if it doesn't exist)
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

-- 4. Create car_comments table (only if it doesn't exist)
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

-- 5. Create indexes for performance (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_car_views_car_id') THEN
        CREATE INDEX idx_car_views_car_id ON car_views(car_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_car_views_user_id') THEN
        CREATE INDEX idx_car_views_user_id ON car_views(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_car_views_created_at') THEN
        CREATE INDEX idx_car_views_created_at ON car_views(created_at);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_car_shares_car_id') THEN
        CREATE INDEX idx_car_shares_car_id ON car_shares(car_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_car_shares_user_id') THEN
        CREATE INDEX idx_car_shares_user_id ON car_shares(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_car_shares_platform') THEN
        CREATE INDEX idx_car_shares_platform ON car_shares(share_platform);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_car_shares_created_at') THEN
        CREATE INDEX idx_car_shares_created_at ON car_shares(created_at);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_car_comments_car_id') THEN
        CREATE INDEX idx_car_comments_car_id ON car_comments(car_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_car_comments_user_id') THEN
        CREATE INDEX idx_car_comments_user_id ON car_comments(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_car_comments_parent_id') THEN
        CREATE INDEX idx_car_comments_parent_id ON car_comments(parent_comment_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_car_comments_created_at') THEN
        CREATE INDEX idx_car_comments_created_at ON car_comments(created_at);
    END IF;
END $$;

-- 6. Enable RLS and create policies (only if they don't exist)
DO $$ 
BEGIN
    -- Enable RLS
    ALTER TABLE car_views ENABLE ROW LEVEL SECURITY;
    ALTER TABLE car_shares ENABLE ROW LEVEL SECURITY;
    ALTER TABLE car_comments ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for car_views (only if they don't exist)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'car_views' AND policyname = 'Anyone can view car views') THEN
        CREATE POLICY "Anyone can view car views" ON car_views FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'car_views' AND policyname = 'Authenticated users can insert views') THEN
        CREATE POLICY "Authenticated users can insert views" ON car_views FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    -- Create policies for car_shares (only if they don't exist)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'car_shares' AND policyname = 'Anyone can view car shares') THEN
        CREATE POLICY "Anyone can view car shares" ON car_shares FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'car_shares' AND policyname = 'Authenticated users can insert shares') THEN
        CREATE POLICY "Authenticated users can insert shares" ON car_shares FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    -- Create policies for car_comments (only if they don't exist)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'car_comments' AND policyname = 'Anyone can view car comments') THEN
        CREATE POLICY "Anyone can view car comments" ON car_comments FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'car_comments' AND policyname = 'Authenticated users can insert comments') THEN
        CREATE POLICY "Authenticated users can insert comments" ON car_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'car_comments' AND policyname = 'Users can update their own comments') THEN
        CREATE POLICY "Users can update their own comments" ON car_comments FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'car_comments' AND policyname = 'Users can delete their own comments') THEN
        CREATE POLICY "Users can delete their own comments" ON car_comments FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 7. Create helper function for checking car ownership (only if it doesn't exist)
CREATE OR REPLACE FUNCTION is_car_owner(car_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM cars 
        WHERE id = car_id AND user_id = user_id
    );
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to update car counts with anti-farming protection
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

-- 9. Create triggers to automatically update car counts (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_car_view_count') THEN
        CREATE TRIGGER trigger_update_car_view_count
            AFTER INSERT OR DELETE ON car_views
            FOR EACH ROW EXECUTE FUNCTION update_car_counts();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_car_share_count') THEN
        CREATE TRIGGER trigger_update_car_share_count
            AFTER INSERT OR DELETE ON car_shares
            FOR EACH ROW EXECUTE FUNCTION update_car_counts();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_car_comment_count') THEN
        CREATE TRIGGER trigger_update_car_comment_count
            AFTER INSERT OR DELETE ON car_comments
            FOR EACH ROW EXECUTE FUNCTION update_car_counts();
    END IF;
END $$;

-- 10. Update existing cars to have default counts
UPDATE cars SET 
    view_count = COALESCE(view_count, 0),
    share_count = COALESCE(share_count, 0),
    comment_count = COALESCE(comment_count, 0);

-- Migration completed successfully!
SELECT 'Premium features migration completed successfully!' as status;
