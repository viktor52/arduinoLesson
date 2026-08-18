import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { prisma } from '../lib/prisma';
import { SYNTAX_QUESTIONS, getSyntaxQuestionById } from '../data/syntaxQuestions';
import { checkSyntaxQuestionAnswer } from '../services/syntaxQuestionService';
import { z } from 'zod';

const router = Router();

const checkAnswerSchema = z.object({
  answer: z.string().max(500),
});

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  res.json(
    SYNTAX_QUESTIONS.map(({ id, order, category, prompt }) => ({
      id,
      order,
      category,
      prompt,
    }))
  );
});

router.get('/progress', authenticate, async (req: AuthRequest, res: Response) => {
  const completed = await prisma.questionProgress.findMany({
    where: { userId: req.userId! },
    select: { questionId: true, completedAt: true },
    orderBy: { completedAt: 'asc' },
  });

  res.json({
    total: SYNTAX_QUESTIONS.length,
    completedCount: completed.length,
    completedIds: completed.map((c) => c.questionId),
  });
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const question = getSyntaxQuestionById(req.params.id);
  if (!question) {
    res.status(404).json({ message: 'Question not found' });
    return;
  }

  const { patterns: _p, ...publicQuestion } = question;
  res.json(publicQuestion);
});

router.post(
  '/:id/check',
  authenticate,
  validateBody(checkAnswerSchema),
  async (req: AuthRequest, res: Response) => {
    const question = getSyntaxQuestionById(req.params.id);
    if (!question) {
      res.status(404).json({ message: 'Question not found' });
      return;
    }

    const { answer } = req.body;
    const result = checkSyntaxQuestionAnswer(question, answer);

    if (result.passed) {
      await prisma.questionProgress.upsert({
        where: {
          userId_questionId: {
            userId: req.userId!,
            questionId: question.id,
          },
        },
        create: {
          userId: req.userId!,
          questionId: question.id,
        },
        update: {
          completedAt: new Date(),
        },
      });
    }

    res.json({
      passed: result.passed,
      message: result.message,
      tests: result.tests,
      hint: result.passed ? undefined : question.hint,
    });
  }
);

export default router;
