import { Router } from 'express';
import supabase from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const BUCKET = 'post-media';

// POST /api/upload
// Body: { data: 'data:image/jpeg;base64,...', type: 'image' | 'video' }
router.post('/', requireAuth, async (req, res) => {
  const { data: dataUri, type } = req.body;
  if (!dataUri) return res.status(400).json({ error: 'Нет файла' });

  // Parse data URI
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return res.status(400).json({ error: 'Неверный формат файла' });

  const [, mime, base64] = match;
  const buffer = Buffer.from(base64, 'base64');

  // Limit: 15 MB for images, 50 MB for video (but body limit is already set)
  const maxBytes = type === 'video' ? 50 * 1024 * 1024 : 15 * 1024 * 1024;
  if (buffer.byteLength > maxBytes) {
    return res.status(400).json({ error: `Файл слишком большой (макс. ${type === 'video' ? '50' : '15'} МБ)` });
  }

  const ext = mime.split('/')[1]?.split(';')[0] || 'bin';
  const path = `${req.user.id}/${uuidv4()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mime, upsert: false });

  if (uploadError) return res.status(500).json({ error: uploadError.message });

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

  res.json({ url: publicUrl, type: type === 'video' ? 'video' : 'image' });
});

export default router;
