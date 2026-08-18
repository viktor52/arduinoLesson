import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { noteSchema } from '../validators/schemas';
import { generateAssignment } from '../services/assignmentService';

const router = Router();

router.get('/daily', authenticate, async (req: AuthRequest, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let challenge = await prisma.dailyChallenge.findUnique({
    where: { userId_date: { userId: req.userId!, date: today } },
  });

  if (!challenge) {
    const data = generateAssignment(4 + Math.floor(Math.random() * 3), 'Random challenge');
    const assignment = await prisma.assignment.create({
      data: {
        userId: req.userId!,
        title: `Daily Challenge: ${data.title}`,
        objective: data.objective,
        difficulty: data.difficulty,
        topic: data.topic || 'Daily',
        components: data.components,
        instructions: data.instructions,
        hint: data.hint,
        starterCode: data.starterCode,
        solutionCode: data.solutionCode,
        testVariables: data.testVariables,
        syntaxConcepts: data.syntaxConcepts,
        isDailyChallenge: true,
      },
    });

    challenge = await prisma.dailyChallenge.create({
      data: {
        userId: req.userId!,
        assignmentId: assignment.id,
        date: today,
      },
    });
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: challenge.assignmentId },
  });

  res.json({
    date: challenge.date.toISOString(),
    completed: challenge.completed,
    score: challenge.score,
    assignment,
  });
});

router.post('/notes', authenticate, validateBody(noteSchema), async (req: AuthRequest, res: Response) => {
  const note = await prisma.note.create({
    data: {
      userId: req.userId!,
      title: req.body.title,
      content: req.body.content,
      assignmentId: req.body.assignmentId,
    },
  });
  res.status(201).json(note);
});

router.put('/notes/:id', authenticate, validateBody(noteSchema), async (req: AuthRequest, res: Response) => {
  const note = await prisma.note.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });

  if (!note) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }

  const updated = await prisma.note.update({
    where: { id: note.id },
    data: { title: req.body.title, content: req.body.content },
  });

  res.json(updated);
});

router.delete('/notes/:id', authenticate, async (req: AuthRequest, res: Response) => {
  await prisma.note.deleteMany({
    where: { id: req.params.id, userId: req.userId },
  });
  res.json({ message: 'Note deleted' });
});

export default router;
