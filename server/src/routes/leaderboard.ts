import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (_req, res: Response) => {
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    orderBy: { xp: 'desc' },
    take: 50,
    select: {
      username: true,
      displayName: true,
      xp: true,
      level: true,
      completedAssignments: true,
      averageScore: true,
    },
  });

  res.json(
    users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      displayName: user.displayName,
      xp: user.xp,
      level: user.level,
      completedAssignments: user.completedAssignments,
      averageScore: user.averageScore,
    }))
  );
});

export default router;
