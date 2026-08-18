import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  getExamAssignmentForUser,
  getUserExams,
  submitExamAnswer,
} from '../services/examService';

const router = Router();

router.use(authenticate);

const answerSchema = z.object({
  answer: z.string().max(500),
});

router.get('/', async (req: AuthRequest, res: Response) => {
  const exams = await getUserExams(req.userId!);
  res.json(exams);
});

router.get('/:assignmentId', async (req: AuthRequest, res: Response) => {
  const exam = await getExamAssignmentForUser(req.params.assignmentId, req.userId!);
  if (!exam) {
    res.status(404).json({ message: 'Exam not found' });
    return;
  }
  res.json(exam);
});

router.post(
  '/:assignmentId/questions/:questionId/check',
  validateBody(answerSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const result = await submitExamAnswer(
        req.params.assignmentId,
        req.userId!,
        req.params.questionId,
        req.body.answer
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to submit answer' });
    }
  }
);

export default router;
