import { Router } from 'express';
import supabase from '../lib/supabase.js';

const router = Router();

// GET /api/diagnoses/search?q=кашель
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q?.trim()) return res.json({ diagnoses: [] });

  const { data, error } = await supabase.rpc('search_diagnoses_by_symptom', {
    search_term: q.trim()
  });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ diagnoses: data || [] });
});

// GET /api/diagnoses — все диагнозы (для автодополнения симптомов)
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('diagnoses')
    .select('id, name, category, symptoms, severity')
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  res.json({ diagnoses: data || [] });
});

export default router;
