import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { hintSchema } from '../validators/schemas';
import { generateHint } from '../services/assignmentService';
import { sanitizePromptInput } from '../utils/sanitize';

const router = Router();

router.post('/', authenticate, validateBody(hintSchema), async (req: AuthRequest, res: Response) => {
  const { assignmentId, code } = req.body;
  const userId = req.userId!;
  const sanitizedCode = sanitizePromptInput(code);

  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, userId },
  });

  if (!assignment) {
    res.status(404).json({ message: 'Assignment not found' });
    return;
  }

  const lastSubmission = await prisma.submission.findFirst({
    where: { assignmentId, userId },
    orderBy: { createdAt: 'desc' },
  });

  const hintLevel = Math.min(
    (lastSubmission?.hintLevel || 0) + 1,
    req.body.hintLevel || 3
  );

  const hint = generateHint(assignment, sanitizedCode, hintLevel);

  await prisma.submission.create({
    data: {
      userId,
      assignmentId,
      code: sanitizedCode,
      hintLevel,
    },
  });

  await prisma.aiFeedback.create({
    data: {
      userId,
      assignmentId,
      type: 'hint',
      content: hint as object,
    },
  });

  res.json(hint);
});

export default router;
