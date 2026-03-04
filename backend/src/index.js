import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import feedRoutes from './routes/feed.js';
import commentsRoutes from './routes/comments.js';
import messagesRoutes from './routes/messages.js';
import casesRoutes from './routes/cases.js';
import profileRoutes from './routes/profile.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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


// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'anamnez' }));

app.listen(PORT, () => {
  console.log(`🩺 Анамнез backend запущен на порту ${PORT}`);
});
