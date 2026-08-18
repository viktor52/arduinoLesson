import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { reviewSchema } from '../validators/schemas';
import { reviewAgainstTestVariables } from '../services/codeReviewService';
import {
  awardXp,
  updateStreak,
  updateAverageScore,
  checkAndAwardAchievements,
  calculateSubmissionXp,
} from '../services/progressService';
import { sanitizePromptInput } from '../utils/sanitize';

const router = Router();

router.post('/', authenticate, validateBody(reviewSchema), async (req: AuthRequest, res: Response) => {
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

  const submission = await prisma.submission.create({
    data: {
      userId,
      assignmentId,
      code: sanitizedCode,
    },
  });

  res.status(201).json(submission);
});

router.post('/review', authenticate, validateBody(reviewSchema), async (req: AuthRequest, res: Response) => {
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

  if (assignment.gradingDisabled) {
    res.status(400).json({ message: 'Grading is disabled after revealing the solution' });
    return;
  }

  const review = reviewAgainstTestVariables(
    sanitizedCode,
    assignment.testVariables,
    assignment.title,
    assignment.solutionCode
  );

  const submission = await prisma.submission.create({
    data: {
      userId,
      assignmentId,
      code: sanitizedCode,
      score: review.score,
      passed: review.passed,
      feedback: review.feedback as object,
      mistakes: review.mistakes,
      suggestions: review.suggestions,
      tests: review.tests as object,
    },
  });

  await prisma.aiFeedback.create({
    data: {
      userId,
      assignmentId,
      submissionId: submission.id,
      type: 'review',
      content: review as object,
    },
  });

  let xpEarned = 0;
  let newAchievements: string[] = [];
  let streak = 0;

  if (review.passed) {
    streak = await updateStreak(userId);
    await updateAverageScore(userId, review.score);
    xpEarned = calculateSubmissionXp(review.score, assignment.difficulty);
    await awardXp(userId, xpEarned);
    newAchievements = await checkAndAwardAchievements(userId, {
      score: review.score,
      topic: assignment.topic || undefined,
      passed: review.passed,
    });
  }

  res.json({
    ...review,
    submissionId: submission.id,
    xpEarned,
    newAchievements,
    streak,
  });
});

export default router;
