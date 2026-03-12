-- Friendships (follow system)
CREATE TABLE IF NOT EXISTS friendships (
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, friend_id),
  CHECK (user_id <> friend_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Anyone can view friendships (for friend count display)
CREATE POLICY "friendships_select" ON friendships FOR SELECT USING (true);
-- Only owner can add
CREATE POLICY "friendships_insert" ON friendships FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Owner can remove either direction
CREATE POLICY "friendships_delete" ON friendships FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);
