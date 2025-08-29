-- Fix Security Issues
-- This migration addresses the Performance Advisor error and warnings

-- 1. Enable RLS on car_likes table (fixes the error)
-- Check if table exists first
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'car_likes' AND table_schema = 'public') THEN
        ALTER TABLE car_likes ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies for car_likes table
        DROP POLICY IF EXISTS "car_likes_select_policy" ON car_likes;
        DROP POLICY IF EXISTS "car_likes_insert_policy" ON car_likes;
        DROP POLICY IF EXISTS "car_likes_delete_policy" ON car_likes;
        
        CREATE POLICY "car_likes_select_policy" ON car_likes
          FOR SELECT USING (true);  -- Allow public viewing of likes

        CREATE POLICY "car_likes_insert_policy" ON car_likes
          FOR INSERT WITH CHECK (
            auth.uid() IS NOT NULL AND auth.uid() = user_id
          );

        CREATE POLICY "car_likes_delete_policy" ON car_likes
          FOR DELETE USING (
            auth.uid() IS NOT NULL AND auth.uid() = user_id
          );
    END IF;
END $$;

-- 2. Fix Function Search Path Mutable warnings by setting search_path
-- Update all functions to have explicit search_path

-- Fix handle_new_user function (check if it exists first)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger AS $func$
        BEGIN
          INSERT INTO public.profiles (id, username, full_name, avatar_url)
          VALUES (new.id, new.raw_user_meta_data->>''username'', new.raw_user_meta_data->>''full_name'', new.raw_user_meta_data->>''avatar_url'');
          RETURN new;
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public';
    END IF;
END $$;

-- Fix generate_unique_username function (check if it exists first)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_unique_username' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        -- Try to get the function signature to determine which version to create
        IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_unique_username' AND pronargs = 1) THEN
            -- Function with one parameter (base_username TEXT)
            EXECUTE 'CREATE OR REPLACE FUNCTION public.generate_unique_username(base_username TEXT)
            RETURNS TEXT AS $func$
            DECLARE
                new_username TEXT;
                counter INTEGER := 1;
            BEGIN
                new_username := base_username;
                
                WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) LOOP
                    new_username := base_username || counter;
                    counter := counter + 1;
                END LOOP;
                
                RETURN new_username;
            END;
            $func$ LANGUAGE plpgsql SET search_path = public';
        ELSE
            -- Function with no parameters (original version)
            EXECUTE 'CREATE OR REPLACE FUNCTION public.generate_unique_username()
            RETURNS TEXT AS $func$
            DECLARE
                username TEXT;
                counter INTEGER := 0;
            BEGIN
                LOOP
                    username := ''user_'' || floor(random() * 1000000)::TEXT;
                    IF counter > 0 THEN
                        username := username || ''_'' || counter;
                    END IF;
                    
                    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.username = username) THEN
                        RETURN username;
                    END IF;
                    
                    counter := counter + 1;
                END LOOP;
            END;
            $func$ LANGUAGE plpgsql SET search_path = public';
        END IF;
    END IF;
END $$;

-- Fix update_updated_at_column function
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION public.update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql SET search_path = public';
    END IF;
END $$;

-- Fix generate_url_slug function (check if it exists first)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_url_slug' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        -- Drop the existing function first to avoid parameter name conflicts
        DROP FUNCTION IF EXISTS public.generate_url_slug(TEXT);
        
        -- Recreate with the same parameter name but add search_path
        EXECUTE 'CREATE OR REPLACE FUNCTION public.generate_url_slug(car_name TEXT)
        RETURNS TEXT AS $func$
        BEGIN
          RETURN lower(regexp_replace(car_name, ''[^a-zA-Z0-9\s-]'', '''', ''g''));
        END;
        $func$ LANGUAGE plpgsql SET search_path = public';
    END IF;
END $$;

-- Fix generate_unique_url_slug function (check if it exists first)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_unique_url_slug' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        -- Check if it takes 2 or 4 parameters
        IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_unique_url_slug' AND pronargs = 4) THEN
            -- Function with 4 parameters (base_slug, table_name, id_column, exclude_id)
            EXECUTE 'CREATE OR REPLACE FUNCTION public.generate_unique_url_slug(base_slug TEXT, table_name TEXT, id_column TEXT, exclude_id UUID DEFAULT NULL)
            RETURNS TEXT AS $func$
            DECLARE
                new_slug TEXT;
                counter INTEGER := 1;
            BEGIN
                new_slug := base_slug;
                
                WHILE EXISTS (
                    EXECUTE format(''SELECT 1 FROM public.%I WHERE %I = $1 AND ($2::uuid IS NULL OR id != $2)'', table_name, id_column)
                    USING new_slug, exclude_id
                ) LOOP
                    new_slug := base_slug || ''-'' || counter;
                    counter := counter + 1;
                END LOOP;
                
                RETURN new_slug;
            END;
            $func$ LANGUAGE plpgsql SET search_path = public';
        ELSIF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_unique_url_slug' AND pronargs = 2) THEN
            -- Function with 2 parameters (base_slug, user_id)
            EXECUTE 'CREATE OR REPLACE FUNCTION public.generate_unique_url_slug(base_slug TEXT, user_id UUID)
            RETURNS TEXT AS $func$
            DECLARE
                new_slug TEXT;
                counter INTEGER := 1;
            BEGIN
                new_slug := base_slug;
                
                WHILE EXISTS (SELECT 1 FROM public.cars WHERE url_slug = new_slug AND user_id = $2) LOOP
                    new_slug := base_slug || ''-'' || counter;
                    counter := counter + 1;
                END LOOP;
                
                RETURN new_slug;
            END;
            $func$ LANGUAGE plpgsql SET search_path = public';
        END IF;
    END IF;
END $$;

-- Fix auto_generate_url_slug function
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'auto_generate_url_slug' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION public.auto_generate_url_slug()
        RETURNS TRIGGER AS $func$
        BEGIN
          IF NEW.url_slug IS NULL OR NEW.url_slug = '''' THEN
            NEW.url_slug := public.generate_unique_url_slug(
              public.generate_url_slug(NEW.name || '' '' || NEW.make || '' '' || NEW.model),
              ''cars'',
              ''url_slug'',
              NEW.id
            );
          END IF;
          RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql SET search_path = public';
    END IF;
END $$;

-- Fix get_current_user_id function
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_current_user_id' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION public.get_current_user_id()
        RETURNS UUID AS $func$
        BEGIN
          RETURN auth.uid();
        END;
        $func$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public';
    END IF;
END $$;

-- Fix update_car_like_count function
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_car_like_count' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION public.update_car_like_count()
        RETURNS TRIGGER AS $func$
        BEGIN
          IF TG_OP = ''INSERT'' THEN
            UPDATE public.cars 
            SET like_count = like_count + 1 
            WHERE id = NEW.car_id;
            RETURN NEW;
          ELSIF TG_OP = ''DELETE'' THEN
            UPDATE public.cars 
            SET like_count = like_count - 1 
            WHERE id = OLD.car_id;
            RETURN OLD;
          END IF;
          RETURN NULL;
        END;
        $func$ LANGUAGE plpgsql SET search_path = public';
    END IF;
END $$;

-- Add comments to document the security fixes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'car_likes' AND table_schema = 'public') THEN
        EXECUTE 'COMMENT ON TABLE car_likes IS ''Car likes table with RLS enabled for security''';
        EXECUTE 'COMMENT ON POLICY "car_likes_select_policy" ON car_likes IS ''Allow public viewing of car likes''';
        EXECUTE 'COMMENT ON POLICY "car_likes_insert_policy" ON car_likes IS ''Allow authenticated users to like cars''';
        EXECUTE 'COMMENT ON POLICY "car_likes_delete_policy" ON car_likes IS ''Allow users to unlike their own likes''';
    END IF;
END $$;
