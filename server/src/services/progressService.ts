import { prisma } from '../lib/prisma';
import { ACHIEVEMENT_DEFINITIONS, levelFromXp, xpForLevel } from '@arduino/shared';

export async function awardXp(userId: string, amount: number): Promise<{ xp: number; level: number; leveledUp: boolean }> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const oldLevel = user.level;
  const newXp = user.xp + amount;
  const newLevel = levelFromXp(newXp);

  await prisma.user.update({
    where: { id: userId },
    data: { xp: newXp, level: newLevel },
  });

  return { xp: newXp, level: newLevel, leveledUp: newLevel > oldLevel };
}

export async function updateStreak(userId: string): Promise<number> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let newStreak = user.streak;

  if (!user.lastActiveDate) {
    newStreak = 1;
  } else {
    const lastActive = new Date(user.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      newStreak = user.streak;
    } else if (diffDays === 1) {
      newStreak = user.streak + 1;
    } else {
      newStreak = 1;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { streak: newStreak, lastActiveDate: today },
  });

  return newStreak;
}

export async function updateAverageScore(userId: string, newScore: number): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const total = user.averageScore * user.completedAssignments;
  const newCompleted = user.completedAssignments + 1;
  const newAverage = (total + newScore) / newCompleted;

  await prisma.user.update({
    where: { id: userId },
    data: {
      completedAssignments: newCompleted,
      averageScore: Math.round(newAverage * 10) / 10,
    },
  });
}

export async function checkAndAwardAchievements(
  userId: string,
  context: { score?: number; topic?: string; passed?: boolean }
): Promise<string[]> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { achievements: { include: { achievement: true } } },
  });

  const earnedSlugs = new Set(user.achievements.map((ua) => ua.achievement.slug));
  const newlyEarned: string[] = [];

  async function award(slug: string) {
    if (earnedSlugs.has(slug)) return;
    const achievement = await prisma.achievement.findUnique({ where: { slug } });
    if (!achievement) return;

    await prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    });
    await awardXp(userId, achievement.xpReward);
    newlyEarned.push(slug);
    earnedSlugs.add(slug);
  }

  if (user.completedAssignments >= 1) await award('first-assignment');
  if (context.score === 100) await award('perfect-score');
  if (user.streak >= 7) await award('seven-day-streak');
  if (user.completedAssignments >= 50) await award('fifty-assignments');

  if (context.topic) {
    const topicCount = await prisma.assignment.count({
      where: {
        userId,
        topic: { contains: context.topic, mode: 'insensitive' },
        submissions: { some: { passed: true } },
      },
    });

    if (context.topic.toLowerCase().includes('servo') && topicCount >= 5) await award('servo-master');
    if (context.topic.toLowerCase().includes('sensor') && topicCount >= 5) await award('sensor-expert');
    if (context.topic.toLowerCase().includes('function') && topicCount >= 5) await award('function-wizard');
  }

  return newlyEarned;
}

export function calculateSubmissionXp(score: number, difficulty: number): number {
  const baseXp = Math.round(score / 10) * difficulty;
  return Math.max(10, baseXp);
}

export async function seedAchievements(): Promise<void> {
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    await prisma.achievement.upsert({
      where: { slug: def.slug },
      update: { name: def.name, description: def.description, icon: def.icon, xpReward: def.xpReward },
      create: def,
    });
  }
}

export { xpForLevel, levelFromXp };
