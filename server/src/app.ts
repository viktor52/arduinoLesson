import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import assignmentRoutes from './routes/assignment';
import submissionRoutes from './routes/submission';
import hintRoutes from './routes/hint';
import historyRoutes from './routes/history';
import leaderboardRoutes from './routes/leaderboard';
import adminRoutes from './routes/admin';
import extraRoutes from './routes/extra';
import questionsRoutes from './routes/questions';
import adminExamsRoutes from './routes/adminExams';
import examsRoutes from './routes/exams';

function resolveCorsOrigin(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) {
  if (!origin) {
    callback(null, true);
    return;
  }

  const allowed = config.clientUrl
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (allowed.includes('*') || allowed.includes(origin) || /\.vercel\.app$/i.test(origin)) {
    callback(null, true);
    return;
  }

  callback(null, false);
}

export function createApp() {
  const app = express();

  // Required behind Vercel's reverse proxy (rate limiting / IPs)
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({
    origin: resolveCorsOrigin,
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));

  const readLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: 1000,
    message: { message: 'Too many requests, please try again later.' },
    skip: (req) => req.method !== 'GET',
  });

  const writeLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { message: 'Too many requests, please try again later.' },
    skip: (req) => req.method === 'GET',
  });

  const authLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: 20,
    message: { message: 'Too many authentication attempts, please try again later.' },
  });

  const submissionLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: 100,
    message: { message: 'Too many submissions, please try again later.' },
  });

  const hintLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: 60,
    message: { message: 'Too many hint requests, please try again later.' },
  });

  // Read-only requests can be made more frequently; writes use the configured limit.
  app.use('/api', readLimiter);
  app.use('/api', writeLimiter);

  // Apply stricter limits on authentication and expensive write operations.
  app.use('/api/auth', authLimiter);
  app.use('/api/submission', submissionLimiter);
  app.use('/api/hint', hintLimiter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/assignment', assignmentRoutes);
  app.use('/api/submission', submissionRoutes);
  app.use('/api/hint', hintRoutes);
  app.use('/api/history', historyRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/questions', questionsRoutes);
  app.use('/api/admin/exams', adminExamsRoutes);
  app.use('/api/exams', examsRoutes);
  app.use('/api', extraRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
