-- Migration: post reactions table + video_url column on posts

-- 1. Add video_url to posts (if not exists)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url text;

-- 2. Create post_reactions table
CREATE TABLE IF NOT EXISTS post_reactions (
  post_id   uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id   uuid REFERENCES profiles(id) ON DELETE CASCADE,
  emoji     text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- 3. RLS for post_reactions
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reactions_select" ON post_reactions
  FOR SELECT USING (true);

CREATE POLICY "reactions_insert" ON post_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reactions_update" ON post_reactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reactions_delete" ON post_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Supabase Storage bucket 'post-media' (run in dashboard Storage tab or via API)
-- insert into storage.buckets (id, name, public) values ('post-media', 'post-media', true)
--   on conflict do nothing;

-- 5. Storage RLS — allow authenticated users to upload
-- CREATE POLICY "auth_upload" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'post-media' AND auth.role() = 'authenticated');
-- CREATE POLICY "public_read" ON storage.objects FOR SELECT
--   USING (bucket_id = 'post-media');
