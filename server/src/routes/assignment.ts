import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { generateAssignmentSchema, saveCodeSchema } from '../validators/schemas';
import { generateAssignment, explainSolution } from '../services/assignmentService';
import { sanitizePromptInput } from '../utils/sanitize';
import { getCatalogByDifficulty, ASSIGNMENT_CATALOG } from '../data/assignmentCatalog';

const router = Router();

router.get('/catalog/list', authenticate, async (req: AuthRequest, res: Response) => {
  const difficulty = req.query.difficulty ? parseInt(String(req.query.difficulty), 10) : undefined;

  const entries = difficulty
    ? getCatalogByDifficulty(difficulty).map(({ slug, title, difficulty: d, topic, testVariables, estimatedMinutes }) => ({
        slug,
        title,
        difficulty: d,
        topic,
        testVariables,
        estimatedMinutes,
      }))
    : ASSIGNMENT_CATALOG.map(({ slug, title, difficulty: d, topic, testVariables, estimatedMinutes }) => ({
        slug,
        title,
        difficulty: d,
        topic,
        testVariables,
        estimatedMinutes,
      }));

  res.json(entries);
});

router.post('/generate', authenticate, validateBody(generateAssignmentSchema), async (req: AuthRequest, res: Response) => {
  const { difficulty, topic } = req.body;
  const userId = req.userId!;

  const assignmentData = generateAssignment(difficulty, topic);

  const assignment = await prisma.assignment.create({
    data: {
      userId,
      title: assignmentData.title,
      objective: assignmentData.objective,
      difficulty: assignmentData.difficulty,
      topic: assignmentData.topic || topic || 'General',
      components: assignmentData.components,
      instructions: assignmentData.instructions,
      hint: assignmentData.hint,
      starterCode: assignmentData.starterCode,
      solutionCode: assignmentData.solutionCode,
      testVariables: assignmentData.testVariables,
      syntaxConcepts: assignmentData.syntaxConcepts,
      estimatedMinutes: assignmentData.estimatedMinutes || 15,
    },
  });

  res.status(201).json(assignment);
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const assignment = await prisma.assignment.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: {
      submissions: { orderBy: { createdAt: 'desc' }, take: 10 },
      bookmarks: { where: { userId: req.userId! } },
    },
  });

  if (!assignment) {
    res.status(404).json({ message: 'Assignment not found' });
    return;
  }

  const { solutionCode, ...rest } = assignment;
  res.json({
    ...rest,
    solutionCode: assignment.solutionRevealed ? solutionCode : undefined,
    isBookmarked: assignment.bookmarks.length > 0,
  });
});

router.put('/:id/code', authenticate, validateBody(saveCodeSchema), async (req: AuthRequest, res: Response) => {
  const assignment = await prisma.assignment.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });

  if (!assignment) {
    res.status(404).json({ message: 'Assignment not found' });
    return;
  }

  await prisma.assignment.update({
    where: { id: assignment.id },
    data: { savedCode: sanitizePromptInput(req.body.code) },
  });

  res.json({ message: 'Code saved' });
});

router.post('/:id/reveal', authenticate, async (req: AuthRequest, res: Response) => {
  const assignment = await prisma.assignment.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });

  if (!assignment) {
    res.status(404).json({ message: 'Assignment not found' });
    return;
  }

  const studentCode = assignment.savedCode || '';
  const explanation = explainSolution(assignment, studentCode);

  await prisma.assignment.update({
    where: { id: assignment.id },
    data: { solutionRevealed: true, gradingDisabled: true },
  });

  res.json({
    solutionCode: assignment.solutionCode,
    explanation,
  });
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const assignment = await prisma.assignment.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });

  if (!assignment) {
    res.status(404).json({ message: 'Assignment not found' });
    return;
  }

  await prisma.assignment.delete({ where: { id: assignment.id } });
  res.json({ message: 'Assignment deleted' });
});

router.post('/:id/favorite', authenticate, async (req: AuthRequest, res: Response) => {
  const assignment = await prisma.assignment.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });

  if (!assignment) {
    res.status(404).json({ message: 'Assignment not found' });
    return;
  }

  const updated = await prisma.assignment.update({
    where: { id: assignment.id },
    data: { isFavorite: !assignment.isFavorite },
  });

  res.json({ isFavorite: updated.isFavorite });
});

router.post('/:id/bookmark', authenticate, async (req: AuthRequest, res: Response) => {
  const assignment = await prisma.assignment.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });

  if (!assignment) {
    res.status(404).json({ message: 'Assignment not found' });
    return;
  }

  const existing = await prisma.bookmark.findUnique({
    where: { userId_assignmentId: { userId: req.userId!, assignmentId: assignment.id } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    res.json({ bookmarked: false });
  } else {
    await prisma.bookmark.create({
      data: { userId: req.userId!, assignmentId: assignment.id },
    });
    res.json({ bookmarked: true });
  }
});

export default router;
