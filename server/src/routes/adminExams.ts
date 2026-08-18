import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  assignRandomExamsToStudents,
  assignSyntaxExam,
  createSyntaxExam,
  getAdminExams,
} from '../services/examService';

const router = Router();

router.use(authenticate, requireAdmin);

const createExamSchema = z.object({
  title: z.string().min(1).max(120),
  questionIds: z.array(z.string()).min(1),
});

const assignExamSchema = z.object({
  userIds: z.array(z.string()).optional(),
  assignToAll: z.boolean().optional(),
});

const assignRandomSchema = z.object({
  userIds: z.array(z.string()).optional(),
  assignToAll: z.boolean().optional(),
});

router.get('/', async (_req, res: Response) => {
  const exams = await getAdminExams();
  res.json(exams);
});

router.post('/', validateBody(createExamSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { title, questionIds } = req.body;
    const exam = await createSyntaxExam(req.userId!, title, questionIds);
    res.status(201).json(exam);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create exam' });
  }
});

router.post('/assign-random', validateBody(assignRandomSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { userIds, assignToAll } = req.body;
    const result = await assignRandomExamsToStudents(req.userId!, {
      userIds,
      assignToAll: assignToAll ?? (!userIds || userIds.length === 0),
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to assign random exams' });
  }
});

router.post('/:id/assign', validateBody(assignExamSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { userIds, assignToAll } = req.body;
    if (!assignToAll && (!userIds || userIds.length === 0)) {
      res.status(400).json({ message: 'Select users or use assignToAll' });
      return;
    }
    const result = await assignSyntaxExam(req.params.id, { userIds, assignToAll });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to assign exam' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  await prisma.syntaxExam.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ message: 'Exam deleted' });
});

export default router;
