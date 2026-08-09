-- Clubs feature: clubs, memberships, badge storage

CREATE TABLE IF NOT EXISTS clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  badge_url TEXT,
  founder_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT clubs_name_length CHECK (char_length(trim(name)) BETWEEN 2 AND 80),
  CONSTRAINT clubs_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE TABLE IF NOT EXISTS club_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('founder', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (club_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_clubs_slug ON clubs(slug);
CREATE INDEX IF NOT EXISTS idx_clubs_founder_id ON clubs(founder_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_members_user_id ON club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_club_members_user_role ON club_members(user_id, role);

-- Keep founder membership in sync on club create
CREATE OR REPLACE FUNCTION public.handle_new_club()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO club_members (club_id, user_id, role)
  VALUES (NEW.id, NEW.founder_id, 'founder')
  ON CONFLICT (club_id, user_id) DO UPDATE SET role = 'founder';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_club_created ON clubs;
CREATE TRIGGER on_club_created
  AFTER INSERT ON clubs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_club();

CREATE OR REPLACE FUNCTION public.set_clubs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS clubs_set_updated_at ON clubs;
CREATE TRIGGER clubs_set_updated_at
  BEFORE UPDATE ON clubs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_clubs_updated_at();

CREATE OR REPLACE FUNCTION public.set_club_members_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS club_members_set_updated_at ON club_members;
CREATE TRIGGER club_members_set_updated_at
  BEFORE UPDATE ON club_members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_club_members_updated_at();

-- Role helpers (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_club_manager(p_club_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM club_members
    WHERE club_id = p_club_id
      AND user_id = auth.uid()
      AND role IN ('founder', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_club_founder(p_club_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM club_members
    WHERE club_id = p_club_id
      AND user_id = auth.uid()
      AND role = 'founder'
  );
$$;

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

-- Clubs policies
DROP POLICY IF EXISTS "Anyone can view clubs" ON clubs;
CREATE POLICY "Anyone can view clubs"
  ON clubs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Premium users can create clubs" ON clubs;
CREATE POLICY "Premium users can create clubs"
  ON clubs FOR INSERT
  WITH CHECK (
    founder_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_premium = true
    )
  );

DROP POLICY IF EXISTS "Managers can update clubs" ON clubs;
CREATE POLICY "Managers can update clubs"
  ON clubs FOR UPDATE
  USING (public.is_club_manager(id))
  WITH CHECK (public.is_club_manager(id));

DROP POLICY IF EXISTS "Founders can delete clubs" ON clubs;
CREATE POLICY "Founders can delete clubs"
  ON clubs FOR DELETE
  USING (public.is_club_founder(id));

-- Membership policies
DROP POLICY IF EXISTS "Anyone can view club members" ON club_members;
CREATE POLICY "Anyone can view club members"
  ON club_members FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Managers can add club members" ON club_members;
CREATE POLICY "Managers can add club members"
  ON club_members FOR INSERT
  WITH CHECK (
    public.is_club_manager(club_id)
    AND (
      -- Admins may only add regular members
      role = 'member'
      OR (role = 'admin' AND public.is_club_founder(club_id))
    )
  );

DROP POLICY IF EXISTS "Founders can update member roles" ON club_members;
CREATE POLICY "Founders can update member roles"
  ON club_members FOR UPDATE
  USING (public.is_club_founder(club_id))
  WITH CHECK (
    public.is_club_founder(club_id)
    AND role IN ('admin', 'member')
  );

DROP POLICY IF EXISTS "Managers can remove members" ON club_members;
CREATE POLICY "Managers can remove members"
  ON club_members FOR DELETE
  USING (
    (
      public.is_club_manager(club_id)
      AND role <> 'founder'
      AND user_id <> auth.uid()
    )
    OR (
      -- Members/admins can leave (founder cannot leave via delete)
      user_id = auth.uid()
      AND role <> 'founder'
    )
  );

-- Storage bucket for club badges
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'club-badges',
  'club-badges',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public read access to club badges" ON storage.objects;
CREATE POLICY "Allow public read access to club badges"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'club-badges');

DROP POLICY IF EXISTS "Managers can upload club badges" ON storage.objects;
CREATE POLICY "Managers can upload club badges"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'club-badges'
    AND public.is_club_manager(((storage.foldername(name))[1])::uuid)
  );

DROP POLICY IF EXISTS "Managers can update club badges" ON storage.objects;
CREATE POLICY "Managers can update club badges"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'club-badges'
    AND public.is_club_manager(((storage.foldername(name))[1])::uuid)
  );

DROP POLICY IF EXISTS "Managers can delete club badges" ON storage.objects;
CREATE POLICY "Managers can delete club badges"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'club-badges'
    AND public.is_club_manager(((storage.foldername(name))[1])::uuid)
  );

COMMENT ON TABLE clubs IS 'Car enthusiast clubs with public pages at /c/[slug]';
COMMENT ON TABLE club_members IS 'Club membership with roles founder|admin|member';
COMMENT ON COLUMN clubs.badge_url IS 'Uploaded badge image shown next to member usernames';
