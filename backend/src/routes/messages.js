import { Router } from 'express';
import supabase from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/messages/conversations - список переписок
router.get('/conversations', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('conversation_members')
    .select(`
      conversation_id,
      last_read_at,
      conversation:conversations(id, created_at),
      members:conversations(
        conversation_members(
          user:profiles(id, username, display_name, avatar_url)
        )
      )
    `)
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // Для каждой переписки — последнее сообщение
  const convIds = data.map(d => d.conversation_id);
  const { data: lastMsgs } = await supabase
    .from('messages')
    .select('*, sender:profiles(username, display_name)')
    .in('conversation_id', convIds.length ? convIds : ['none'])
    .order('created_at', { ascending: false });

  const conversations = data.map(conv => {
    const lastMsg = lastMsgs?.find(m => m.conversation_id === conv.conversation_id);
    const otherMembers = conv.members?.conversation_members
      ?.filter(m => m.user?.id !== req.user.id)
      .map(m => m.user) || [];

    return {
      id: conv.conversation_id,
      other_user: otherMembers[0],
      last_message: lastMsg,
      last_read_at: conv.last_read_at,
      unread: lastMsg && new Date(lastMsg.created_at) > new Date(conv.last_read_at) && lastMsg.sender_id !== req.user.id
    };
  });

  res.json({ conversations });
});

// GET /api/messages/:conversationId - сообщения в переписке
router.get('/:conversationId', requireAuth, async (req, res) => {
  // Проверяем что пользователь — участник
  const { data: member } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('conversation_id', req.params.conversationId)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (!member) return res.status(403).json({ error: 'Нет доступа' });

  const { data, error } = await supabase
    .from('messages')
    .select(`*, sender:profiles(id, username, display_name, avatar_url)`)
    .eq('conversation_id', req.params.conversationId)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  // Помечаем как прочитанные
  await supabase
    .from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', req.params.conversationId)
    .eq('user_id', req.user.id);

  res.json({ messages: data });
});

// POST /api/messages/start - начать переписку с пользователем
router.post('/start', requireAuth, async (req, res) => {
  const { target_user_id } = req.body;
  if (!target_user_id) return res.status(400).json({ error: 'Укажи пользователя' });
  if (target_user_id === req.user.id) return res.status(400).json({ error: 'Нельзя написать себе' });

  // Ищем существующую переписку
  const { data: existing } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', req.user.id);

  if (existing?.length) {
    const { data: shared } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', target_user_id)
      .in('conversation_id', existing.map(e => e.conversation_id));

    if (shared?.length) {
      return res.json({ conversation_id: shared[0].conversation_id });
    }
  }

  // Создаём новую переписку
  const { data: conv } = await supabase
    .from('conversations')
    .insert({})
    .select()
    .single();

  await supabase.from('conversation_members').insert([
    { conversation_id: conv.id, user_id: req.user.id },
    { conversation_id: conv.id, user_id: target_user_id }
  ]);

  res.status(201).json({ conversation_id: conv.id });
});

// POST /api/messages/:conversationId/send
router.post('/:conversationId/send', requireAuth, async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Сообщение пустое' });

  // Проверяем участие
  const { data: member } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('conversation_id', req.params.conversationId)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (!member) return res.status(403).json({ error: 'Нет доступа' });

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: req.params.conversationId,
      sender_id: req.user.id,
      content
    })
    .select(`*, sender:profiles(id, username, display_name, avatar_url)`)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

export default router;
