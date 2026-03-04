import { Router } from 'express';
import supabase from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const ALLOWED_EMOJIS = ['❤️', '👍', '🔥', '🤔', '🙏'];

// POST /api/reactions/:postId  { emoji }
// Toggles a reaction (same emoji = remove, different = replace)
router.post('/:postId', requireAuth, async (req, res) => {
  const { postId } = req.params;
  const { emoji } = req.body;

  if (!ALLOWED_EMOJIS.includes(emoji)) {
    return res.status(400).json({ error: 'Недопустимый эмодзи' });
  }

  // Check existing reaction from this user on this post
  const { data: existing } = await supabase
    .from('post_reactions')
    .select('emoji')
    .eq('post_id', postId)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (existing?.emoji === emoji) {
    // Same emoji — remove reaction
    await supabase.from('post_reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', req.user.id);
    return res.json({ emoji: null });
  }

  // Upsert (replace or insert)
  await supabase.from('post_reactions')
    .upsert({ post_id: postId, user_id: req.user.id, emoji }, { onConflict: 'post_id,user_id' });

  res.json({ emoji });
});

// GET /api/reactions/:postId
router.get('/:postId', async (req, res) => {
  const { data, error } = await supabase
    .from('post_reactions')
    .select('emoji')
    .eq('post_id', req.params.postId);

  if (error) return res.status(500).json({ error: error.message });

  // Count per emoji
  const counts = {};
  for (const { emoji } of data) {
    counts[emoji] = (counts[emoji] || 0) + 1;
  }

  res.json({ counts });
});

export default router;
