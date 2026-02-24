import { Router } from 'express';
import supabase from '../lib/supabase.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/cases?difficulty=hard&page=1
router.get('/', optionalAuth, async (req, res) => {
  const { difficulty, page = 1 } = req.query;
  const limit = 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('cases')
    .select(`*, author:profiles(id, username, display_name)`, { count: 'exact' })
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (difficulty) query = query.eq('difficulty', difficulty);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });

  // Если авторизован — добавляем is_solved
  let solvedIds = [];
  if (req.user) {
    const { data: answers } = await supabase
      .from('case_answers')
      .select('case_id')
      .eq('user_id', req.user.id);
    solvedIds = answers?.map(a => a.case_id) || [];
  }

  const cases = data.map(c => ({
    ...c,
    is_solved: solvedIds.includes(c.id),
    accuracy: c.solve_count ? Math.round((c.correct_count / c.solve_count) * 100) : null
  }));

  res.json({ cases, total: count, page: +page });
});

// GET /api/cases/daily - случай дня
router.get('/daily', optionalAuth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('cases')
    .select(`*, author:profiles(id, username, display_name), options:case_options(id, letter, text)`)
    .eq('is_daily', true)
    .eq('daily_date', today)
    .single();

  if (error) return res.status(404).json({ error: 'Случай дня не найден' });
  res.json(data);
});

// GET /api/cases/:id
router.get('/:id', optionalAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('cases')
    .select(`
      *,
      author:profiles(id, username, display_name, avatar_url),
      options:case_options(id, letter, text)
    `)
    .eq('id', req.params.id)
    .eq('is_published', true)
    .single();

  if (error) return res.status(404).json({ error: 'Случай не найден' });

  // Если уже решал — показываем правильный ответ
  if (req.user) {
    const { data: answer } = await supabase
      .from('case_answers')
      .select('option_id, is_correct')
      .eq('case_id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (answer) {
      // Добавляем объяснения к вариантам
      const { data: optionsWithExplanation } = await supabase
        .from('case_options')
        .select('*')
        .eq('case_id', req.params.id);

      return res.json({
        ...data,
        options: optionsWithExplanation,
        user_answer: answer
      });
    }
  }

  res.json(data);
});

// POST /api/cases/:id/answer
router.post('/:id/answer', requireAuth, async (req, res) => {
  const { option_id } = req.body;
  if (!option_id) return res.status(400).json({ error: 'Выбери вариант ответа' });

  // Проверяем что ещё не отвечал
  const { data: existing } = await supabase
    .from('case_answers')
    .select('id')
    .eq('case_id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (existing) return res.status(409).json({ error: 'Ты уже отвечал на этот случай' });

  // Проверяем правильность
  const { data: option } = await supabase
    .from('case_options')
    .select('is_correct, explanation')
    .eq('id', option_id)
    .single();

  const { data: answer } = await supabase
    .from('case_answers')
    .insert({
      case_id: req.params.id,
      user_id: req.user.id,
      option_id,
      is_correct: option.is_correct
    })
    .select()
    .single();

  // Полные варианты с объяснениями
  const { data: allOptions } = await supabase
    .from('case_options')
    .select('*')
    .eq('case_id', req.params.id);

  res.json({
    is_correct: option.is_correct,
    explanation: option.explanation,
    all_options: allOptions
  });
});

export default router;
