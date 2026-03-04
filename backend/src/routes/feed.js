import { Router } from 'express';
import supabase from '../lib/supabase.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/feed?section=feed&page=1
router.get('/', optionalAuth, async (req, res) => {
  const { section = 'feed', page = 1 } = req.query;
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
    .eq('section', section)
    .eq('is_published', true)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return res.status(500).json({ error: error.message });

  const posts = data.map(post => {
    // Count reactions per emoji
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

  res.json({ posts, page: +page });
});

// POST /api/feed - создать пост
router.post('/', requireAuth, async (req, res) => {
  const { content, image_url, video_url, section = 'feed' } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Пост не может быть пустым' });

  const { data, error } = await supabase
    .from('posts')
    .insert({ content, image_url, video_url, section, author_id: req.user.id })
    .select(`*, author:profiles!author_id(id, username, display_name, avatar_url, role)`)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ ...data, reaction_counts: {}, user_reaction: null });
});

// POST /api/feed/:id/like
router.post('/:id/like', requireAuth, async (req, res) => {
  const { id } = req.params;

  const { data: existing } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('post_likes').delete()
      .eq('post_id', id).eq('user_id', req.user.id);
    return res.json({ liked: false });
  } else {
    await supabase.from('post_likes').insert({ post_id: id, user_id: req.user.id });
    return res.json({ liked: true });
  }
});

// DELETE /api/feed/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', req.params.id)
    .eq('author_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Пост удалён' });
});

export default router;
