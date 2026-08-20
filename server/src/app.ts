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

  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { message: 'Too many requests, please try again later.' },
  });
  app.use('/api', limiter);

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
