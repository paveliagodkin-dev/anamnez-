import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { runAurora3DAgent } from '../lib/aurora3d-agent.js';

const router = Router();

// Хранилище сессий (in-memory; для продакшена заменить на Redis/БД)
const sessions = new Map();

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 час

function pruneExpiredSessions() {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.updatedAt > SESSION_TTL_MS) sessions.delete(id);
  }
}

// POST /api/agent/chat
// Body: { message: string, session_id?: string }
router.post('/chat', optionalAuth, async (req, res) => {
  const { message, session_id } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Поле message обязательно' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'Aurora 3D Agent не настроен (нет ANTHROPIC_API_KEY)' });
  }

  pruneExpiredSessions();

  // Восстанавливаем или создаём сессию
  const sessionKey = session_id || `anon_${Date.now()}`;
  const session = sessions.get(sessionKey) || { history: [], createdAt: Date.now() };

  try {
    const { reply, history, usage } = await runAurora3DAgent(message.trim(), session.history);

    // Сохраняем обновлённую историю
    sessions.set(sessionKey, { history, createdAt: session.createdAt, updatedAt: Date.now() });

    return res.json({
      session_id: sessionKey,
      reply,
      usage: {
        input_tokens: usage?.input_tokens,
        output_tokens: usage?.output_tokens,
      },
    });
  } catch (err) {
    console.error('[Aurora3DAgent] Ошибка:', err.message);
    return res.status(500).json({ error: 'Ошибка агента: ' + err.message });
  }
});

// DELETE /api/agent/chat/:session_id  — сбросить историю
router.delete('/chat/:session_id', (req, res) => {
  sessions.delete(req.params.session_id);
  res.json({ ok: true });
});

// GET /api/agent/health
router.get('/health', (_req, res) => {
  res.json({
    agent: 'Aurora 3D Agent',
    configured: !!process.env.ANTHROPIC_API_KEY,
    active_sessions: sessions.size,
  });
});

export default router;
