import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../lib/supabase.js';
import { sendVerificationEmail } from '../lib/email.js';

const router = Router();

// POST /api/auth/register
const VALID_USER_TYPES = ['Врач', 'Студент', 'Преподаватель', 'Мед. персонал', 'Гость'];

router.post('/register', async (req, res) => {
  const { email, password, username, user_type } = req.body;
  if (!email || !password || !username || !user_type) {
    return res.status(400).json({ error: 'Заполни все поля' });
  }
  if (!VALID_USER_TYPES.includes(user_type)) {
    return res.status(400).json({ error: 'Выбери кто ты' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Пароль минимум 8 символов' });
  }

  try {
    // Проверяем, что email/username свободны
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'Почта или псевдоним уже заняты' });
    }

    // Регистрируем через Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // Авто-подтверждаем email через admin API (у нас свой поток верификации)
    await supabase.auth.admin.updateUserById(authData.user.id, {
      email_confirm: true,
    });

    // Обновляем профиль (триггер уже создал строку)
    const role = user_type === 'Врач' ? 'doctor' : 'user';
    await supabase
      .from('profiles')
      .update({ username, specialty: user_type, role, is_verified: true })
      .eq('id', authData.user.id);

    res.status(201).json({
      message: 'Аккаунт создан. Можешь войти.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Введи почту и пароль' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: 'Неверная почта или пароль' });

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }

    const token = jwt.sign(
      { id: profile.id, email: profile.email, role: profile.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/auth/verify-email?token=xxx
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Токен не указан' });

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, is_verified')
      .eq('verification_token', token)
      .maybeSingle();

    if (!profile) return res.status(404).json({ error: 'Токен недействителен' });
    if (profile.is_verified) return res.json({ message: 'Почта уже подтверждена' });

    await supabase
      .from('profiles')
      .update({ is_verified: true, verification_token: null })
      .eq('id', profile.id);

    res.json({ message: 'Почта подтверждена! Теперь можешь войти.' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, is_verified, verification_token')
      .eq('email', email)
      .maybeSingle();

    if (!profile) return res.status(404).json({ error: 'Пользователь не найден' });
    if (profile.is_verified) return res.json({ message: 'Почта уже подтверждена' });

    const newToken = uuidv4();
    await supabase
      .from('profiles')
      .update({ verification_token: newToken })
      .eq('id', profile.id);

    await sendVerificationEmail(email, newToken);
    res.json({ message: 'Письмо отправлено повторно' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
