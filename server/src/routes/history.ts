import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateQuery } from '../middleware/validate';
import { historyQuerySchema } from '../validators/schemas';

const router = Router();

router.get('/', authenticate, validateQuery(historyQuerySchema), async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { search, topic, difficulty, sortBy = 'createdAt', sortOrder = 'desc', passed } = req.query as {
    search?: string;
    topic?: string;
    difficulty?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    passed?: string;
  };

  const assignments = await prisma.assignment.findMany({
    where: {
      userId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { objective: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(topic && { topic: { contains: topic, mode: 'insensitive' } }),
      ...(difficulty && { difficulty }),
      ...(passed === 'true' && { submissions: { some: { passed: true } } }),
      ...(passed === 'false' && { submissions: { none: { passed: true } } }),
    },
    include: {
      submissions: { orderBy: { createdAt: 'desc' }, take: 1 },
      bookmarks: { where: { userId } },
    },
    orderBy: sortBy === 'score'
      ? undefined
      : { [sortBy === 'title' ? 'title' : sortBy === 'difficulty' ? 'difficulty' : 'createdAt']: sortOrder },
  });

  let result = assignments.map((a) => ({
    id: a.id,
    title: a.title,
    objective: a.objective,
    difficulty: a.difficulty,
    topic: a.topic,
    isFavorite: a.isFavorite,
    isBookmarked: a.bookmarks.length > 0,
    solutionRevealed: a.solutionRevealed,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    bestScore: a.submissions[0]?.score ?? null,
    passed: a.submissions[0]?.passed ?? null,
    submissionCount: a.submissions.length,
  }));

  if (sortBy === 'score') {
    result = result.sort((a, b) => {
      const scoreA = a.bestScore ?? -1;
      const scoreB = b.bestScore ?? -1;
      return sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    });
  }

  res.json(result);
});

router.get('/bookmarks', authenticate, async (req: AuthRequest, res: Response) => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: req.userId },
    include: {
      assignment: {
        include: { submissions: { orderBy: { createdAt: 'desc' }, take: 1 } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(
    bookmarks.map((b) => ({
      id: b.assignment.id,
      title: b.assignment.title,
      difficulty: b.assignment.difficulty,
      topic: b.assignment.topic,
      bestScore: b.assignment.submissions[0]?.score ?? null,
      bookmarkedAt: b.createdAt.toISOString(),
    }))
  );
});

router.get('/notes', authenticate, async (req: AuthRequest, res: Response) => {
  const notes = await prisma.note.findMany({
    where: { userId: req.userId },
    orderBy: { updatedAt: 'desc' },
  });
  res.json(notes);
});

export default router;
