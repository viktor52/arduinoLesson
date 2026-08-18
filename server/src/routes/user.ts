import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateUserSchema } from '../validators/schemas';
import { xpProgressInLevel } from '@arduino/shared';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: {
      achievements: {
        include: { achievement: true },
        orderBy: { earnedAt: 'desc' },
      },
    },
  });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const xpProgress = xpProgressInLevel(user.xp);

  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    xp: user.xp,
    level: user.level,
    streak: user.streak,
    completedAssignments: user.completedAssignments,
    averageScore: user.averageScore,
    createdAt: user.createdAt.toISOString(),
    xpProgress,
    achievements: user.achievements.map((ua) => ({
      ...ua.achievement,
      earned: true,
      earnedAt: ua.earnedAt.toISOString(),
    })),
  });
});

router.put('/', authenticate, validateBody(updateUserSchema), async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      displayName: req.body.displayName,
      avatarUrl: req.body.avatarUrl,
    },
  });

  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    xp: user.xp,
    level: user.level,
    streak: user.streak,
    completedAssignments: user.completedAssignments,
    averageScore: user.averageScore,
    createdAt: user.createdAt.toISOString(),
  });
});

router.get('/dashboard', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const [user, recentAssignments, recentSubmissions, totalAssignments] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.assignment.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        submissions: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    }),
    prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { assignment: { select: { title: true } } },
    }),
    prisma.assignment.count({ where: { userId } }),
  ]);

  const completedCount = await prisma.submission.count({
    where: { userId, passed: true },
  });

  const xpProgress = xpProgressInLevel(user.xp);

  res.json({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      completedAssignments: user.completedAssignments,
      averageScore: user.averageScore,
      xpProgress,
    },
    stats: {
      totalAssignments,
      completedCount,
      completionPercent: totalAssignments > 0 ? Math.round((completedCount / totalAssignments) * 100) : 0,
      averageScore: user.averageScore,
      streak: user.streak,
      recentFeedback: recentSubmissions.map((s) => ({
        assignmentTitle: s.assignment.title,
        score: s.score,
        passed: s.passed,
        createdAt: s.createdAt.toISOString(),
      })),
    },
    recentAssignments: recentAssignments.map((a) => ({
      id: a.id,
      title: a.title,
      difficulty: a.difficulty,
      topic: a.topic,
      updatedAt: a.updatedAt.toISOString(),
      lastScore: a.submissions[0]?.score ?? null,
      passed: a.submissions[0]?.passed ?? null,
    })),
  });
});

export default router;
