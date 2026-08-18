import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { generateAssignment } from '../services/assignmentService';
import { seedAchievements } from '../services/progressService';
import { seedAssignmentCatalog } from '../services/catalogSeedService';
import { SYNTAX_QUESTIONS } from '../data/syntaxQuestions';
import { getAdminUserExamResults } from '../services/examService';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/users', async (_req, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      role: true,
      xp: true,
      level: true,
      completedAssignments: true,
      createdAt: true,
    },
  });
  res.json(users);
});

router.get('/users/:userId/exams', async (req, res: Response) => {
  const results = await getAdminUserExamResults(req.params.userId);
  if (!results) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json(results);
});

router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  if (req.params.id === req.userId) {
    res.status(400).json({ message: 'Cannot delete your own account' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true },
  });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: 'User deleted' });
});

router.get('/assignments', async (_req, res: Response) => {
  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { username: true } } },
  });
  res.json(assignments);
});

router.get('/completions', async (req, res: Response) => {
  const completedOnly = req.query.completed === 'true';
  const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;

  const assignments = await prisma.assignment.findMany({
    where: {
      isTemplate: false,
      submissions: completedOnly ? { some: { passed: true } } : { some: {} },
      ...(userId && { userId }),
      ...(search && {
        OR: userId
          ? [{ title: { contains: search, mode: 'insensitive' } }]
          : [
              { title: { contains: search, mode: 'insensitive' } },
              { user: { username: { contains: search, mode: 'insensitive' } } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
            ],
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          email: true,
        },
      },
      submissions: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          score: true,
          passed: true,
          createdAt: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 200,
  });

  const results = assignments.map((assignment) => {
      const reviewSubmissions = assignment.submissions.filter((s) => s.score > 0 || s.passed);
      const attempts = assignment.submissions.length;
      const passedSubmissions = assignment.submissions.filter((s) => s.passed);
      const completed = passedSubmissions.length > 0;
      const bestScore = reviewSubmissions.length
        ? Math.max(...reviewSubmissions.map((s) => s.score))
        : null;
      const lastSubmission = assignment.submissions[assignment.submissions.length - 1];
      const firstPassed = passedSubmissions[0];

      return {
        assignmentId: assignment.id,
        userId: assignment.user.id,
        username: assignment.user.username,
        displayName: assignment.user.displayName,
        email: assignment.user.email,
        title: assignment.title,
        difficulty: assignment.difficulty,
        topic: assignment.topic,
        attempts,
        completed,
        bestScore,
        lastScore: lastSubmission?.score ?? null,
        lastAttemptAt: lastSubmission?.createdAt.toISOString() ?? null,
        completedAt: firstPassed?.createdAt.toISOString() ?? null,
        createdAt: assignment.createdAt.toISOString(),
      };
    });

  const summary = {
    total: results.length,
    completed: results.filter((r) => r.completed).length,
    inProgress: results.filter((r) => !r.completed && r.attempts > 0).length,
    totalAttempts: results.reduce((sum, r) => sum + r.attempts, 0),
  };

  res.json({ summary, items: results });
});

router.delete('/assignments/:id', async (req, res: Response) => {
  await prisma.assignment.delete({ where: { id: req.params.id } });
  res.json({ message: 'Assignment deleted' });
});

router.post('/templates/generate', async (req: AuthRequest, res: Response) => {
  const { difficulty = 5, topic } = req.body;
  const data = generateAssignment(difficulty, topic);

  const template = await prisma.assignment.create({
    data: {
      userId: req.userId!,
      title: data.title,
      objective: data.objective,
      difficulty: data.difficulty,
      topic: data.topic || topic || 'Template',
      components: data.components,
      instructions: data.instructions,
      hint: data.hint,
      starterCode: data.starterCode,
      solutionCode: data.solutionCode,
      testVariables: data.testVariables,
      syntaxConcepts: data.syntaxConcepts,
      isTemplate: true,
    },
  });

  res.status(201).json(template);
});

router.post('/catalog/seed', async (req: AuthRequest, res: Response) => {
  const count = await seedAssignmentCatalog(req.userId!);
  res.json({ message: `Seeded ${count} catalog assignments` });
});

router.get('/analytics', async (_req, res: Response) => {
  const [userCount, assignmentCount, submissionCount, avgScore] = await Promise.all([
    prisma.user.count(),
    prisma.assignment.count(),
    prisma.submission.count(),
    prisma.submission.aggregate({ _avg: { score: true } }),
  ]);

  const recentUsers = await prisma.user.count({
    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
  });

  res.json({
    userCount,
    assignmentCount,
    submissionCount,
    averageScore: Math.round((avgScore._avg.score || 0) * 10) / 10,
    newUsersThisWeek: recentUsers,
  });
});

router.post('/seed', async (_req, res: Response) => {
  await seedAchievements();
  res.json({ message: 'Achievements seeded' });
});

router.get('/questions', async (_req, res: Response) => {
  res.json(SYNTAX_QUESTIONS);
});

export default router;
