import { Router } from 'express';
import supabase from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/profile/me
router.get('/me', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) return res.status(404).json({ error: 'Профиль не найден' });
  res.json(data);
});

// GET /api/profile/:username
router.get('/:username', async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, specialty, role, score, cases_solved, created_at')
    .eq('username', req.params.username)
    .single();

  if (error) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json(data);
});

// PATCH /api/profile/me
router.patch('/me', requireAuth, async (req, res) => {
  const { display_name, bio, specialty, avatar_url } = req.body;
  const { data, error } = await supabase
    .from('profiles')
    .update({ display_name, bio, specialty, avatar_url, updated_at: new Date().toISOString() })
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/profile/leaderboard
router.get('/leaderboard/top', async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, specialty, score, cases_solved')
    .order('score', { ascending: false })
    .limit(10);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ leaderboard: data });
});

export default router;
