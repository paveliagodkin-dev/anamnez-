import { Router } from 'express';
import supabase from '../lib/supabase.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/comments/:postId
router.get('/:postId', optionalAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles(id, username, display_name, avatar_url, role),
      liked:comment_likes(user_id)
    `)
    .eq('post_id', req.params.postId)
    .is('parent_id', null) // только корневые
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  // Получаем ответы на комментарии
  const commentIds = data.map(c => c.id);
  const { data: replies } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles(id, username, display_name, avatar_url, role)
    `)
    .in('parent_id', commentIds.length ? commentIds : ['none'])
    .order('created_at', { ascending: true });

  const comments = data.map(comment => ({
    ...comment,
    is_liked: req.user ? comment.liked.some(l => l.user_id === req.user.id) : false,
    liked: undefined,
    replies: replies?.filter(r => r.parent_id === comment.id) || []
  }));

  res.json({ comments });
});

// POST /api/comments/:postId
router.post('/:postId', requireAuth, async (req, res) => {
  const { content, parent_id } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Комментарий пуст' });

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: req.params.postId,
      author_id: req.user.id,
      content,
      parent_id: parent_id || null
    })
    .select(`*, author:profiles(id, username, display_name, avatar_url, role)`)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// POST /api/comments/:id/like
router.post('/:id/like', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { data: existing } = await supabase
    .from('comment_likes')
    .select('comment_id')
    .eq('comment_id', id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('comment_likes').delete()
      .eq('comment_id', id).eq('user_id', req.user.id);
    await supabase.from('comments')
      .update({ likes_count: supabase.sql`likes_count - 1` })
      .eq('id', id);
    return res.json({ liked: false });
  } else {
    await supabase.from('comment_likes').insert({ comment_id: id, user_id: req.user.id });
    await supabase.from('comments')
      .update({ likes_count: supabase.sql`likes_count + 1` })
      .eq('id', id);
    return res.json({ liked: true });
  }
});

// DELETE /api/comments/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', req.params.id)
    .eq('author_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Удалено' });
});

export default router;
