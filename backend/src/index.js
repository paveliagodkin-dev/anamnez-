import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

import authRoutes from './routes/auth.js';
import feedRoutes from './routes/feed.js';
import commentsRoutes from './routes/comments.js';
import messagesRoutes from './routes/messages.js';
import casesRoutes from './routes/cases.js';
import profileRoutes from './routes/profile.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Health check (before CORS to avoid header issues)
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'anamnez' }));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100,
  message: { error: 'Слишком много запросов, попробуй позже' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Слишком много попыток входа' }
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/profile', profileRoutes);

// Serve frontend static files (SPA)
const DIST = resolve(__dirname, '../../frontend/dist');
if (existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get('*', (req, res) => {
    res.sendFile(resolve(DIST, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🩺 Анамнез backend запущен на порту ${PORT}`);
});
