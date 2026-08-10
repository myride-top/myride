-- Club extensions: events link, country, primary club, join requests

ALTER TABLE events ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES clubs(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_events_club_id ON events(club_id);

ALTER TABLE clubs ADD COLUMN IF NOT EXISTS country TEXT;

ALTER TABLE club_members ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS club_members_one_primary_per_user
  ON club_members (user_id)
  WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_clubs_country ON clubs(country);

-- Join requests
CREATE TABLE IF NOT EXISTS club_join_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (club_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_club_join_requests_club_id ON club_join_requests(club_id);
CREATE INDEX IF NOT EXISTS idx_club_join_requests_user_id ON club_join_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_club_join_requests_status ON club_join_requests(club_id, status);

ALTER TABLE club_join_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Requesters and managers can view join requests" ON club_join_requests;
CREATE POLICY "Requesters and managers can view join requests"
  ON club_join_requests FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_club_manager(club_id)
  );

DROP POLICY IF EXISTS "Users can request to join clubs" ON club_join_requests;
CREATE POLICY "Users can request to join clubs"
  ON club_join_requests FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND NOT EXISTS (
      SELECT 1 FROM club_members
      WHERE club_id = club_join_requests.club_id
        AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Managers can review join requests" ON club_join_requests;
CREATE POLICY "Managers can review join requests"
  ON club_join_requests FOR UPDATE
  USING (public.is_club_manager(club_id))
  WITH CHECK (public.is_club_manager(club_id));

DROP POLICY IF EXISTS "Users can re-request after rejection" ON club_join_requests;
CREATE POLICY "Users can re-request after rejection"
  ON club_join_requests FOR UPDATE
  USING (auth.uid() = user_id AND status = 'rejected')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Users may set their own primary club membership
DROP POLICY IF EXISTS "Users can set primary club" ON club_members;
CREATE POLICY "Users can set primary club"
  ON club_members FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

COMMENT ON TABLE club_join_requests IS 'Pending/approved/rejected requests to join a club';
COMMENT ON COLUMN club_members.is_primary IS 'At most one primary club per user (shown prominently on profile)';
COMMENT ON COLUMN clubs.country IS 'ISO 3166-1 alpha-2 country code for explore filtering';
