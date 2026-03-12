import { Router } from 'express';
import supabase from '../lib/supabase.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/users/search?q=nickname
router.get('/search', optionalAuth, async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) return res.json({ users: [] });

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, role, specialty, score')
    .or(`username.ilike.%${q.trim()}%,display_name.ilike.%${q.trim()}%`)
    .limit(20);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ users: data || [] });
});

// GET /api/users/:id/friendship — is current user friends with :id
router.get('/:id/friendship', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { data } = await supabase
    .from('friendships')
    .select('created_at')
    .eq('user_id', req.user.id)
    .eq('friend_id', id)
    .maybeSingle();

  res.json({ is_friend: !!data });
});

// POST /api/users/:id/friend — add friend
router.post('/:id/friend', requireAuth, async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) return res.status(400).json({ error: 'Нельзя добавить себя' });

  const { error } = await supabase
    .from('friendships')
    .insert({ user_id: req.user.id, friend_id: id });

  if (error && error.code !== '23505') return res.status(500).json({ error: error.message });
  res.json({ is_friend: true });
});

// DELETE /api/users/:id/friend — remove friend
router.delete('/:id/friend', requireAuth, async (req, res) => {
  const { id } = req.params;

  await supabase
    .from('friendships')
    .delete()
    .eq('user_id', req.user.id)
    .eq('friend_id', id);

  res.json({ is_friend: false });
});

// GET /api/users/:id/posts?page=1 — posts by user
router.get('/:id/posts', optionalAuth, async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(id, username, display_name, avatar_url, role, specialty, score),
      liked:post_likes(user_id),
      reactions:post_reactions(emoji, user_id)
    `)
    .eq('author_id', id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return res.status(500).json({ error: error.message });

  const posts = data.map(post => {
    const reactionCounts = {};
    for (const r of post.reactions || []) {
      reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
    }
    return {
      ...post,
      is_liked: req.user ? post.liked.some(l => l.user_id === req.user.id) : false,
      user_reaction: req.user ? (post.reactions?.find(r => r.user_id === req.user.id)?.emoji || null) : null,
      reaction_counts: reactionCounts,
      liked: undefined,
      reactions: undefined,
    };
  });

  res.json({ posts, page });
});

export default router;
