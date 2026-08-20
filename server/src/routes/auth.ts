import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { generateToken, getTokenExpiry } from '../utils/jwt';
import { sanitizeEmail, sanitizeUsername } from '../utils/sanitize';
import { validateBody } from '../middleware/validate';
import { authenticate, AuthRequest } from '../middleware/auth';
import { registerSchema, loginSchema } from '../validators/schemas';

const router = Router();

function formatUser(user: {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  xp: number;
  level: number;
  streak: number;
  completedAssignments: number;
  averageScore: number;
  createdAt: Date;
}) {
  return {
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
  };
}

router.post('/register', validateBody(registerSchema), async (req, res: Response) => {
  const email = sanitizeEmail(req.body.email);
  const username = sanitizeUsername(req.body.username);
  const { password, displayName } = req.body;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    res.status(409).json({ message: 'Email or username already exists' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      displayName: displayName || username,
    },
  });

  const token = generateToken({ userId: user.id, role: user.role });
  await prisma.session.create({
    data: { userId: user.id, token, expiresAt: getTokenExpiry() },
  });

  res.status(201).json({ token, user: formatUser(user) });
});

router.post('/login', validateBody(loginSchema), async (req, res: Response) => {
  const email = sanitizeEmail(req.body.email);
  const { password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const token = generateToken({ userId: user.id, role: user.role });
  await prisma.session.create({
    data: { userId: user.id, token, expiresAt: getTokenExpiry() },
  });

  res.json({ token, user: formatUser(user) });
});

router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  res.json({ message: 'Logged out successfully' });
});

export default router;
