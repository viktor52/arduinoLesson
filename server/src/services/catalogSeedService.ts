import { prisma } from '../lib/prisma';
import {
  ASSIGNMENT_CATALOG,
  MIN_LIBRARY_DIFFICULTY,
} from '../data/assignmentCatalog';

export async function seedAssignmentCatalog(adminUserId: string): Promise<number> {
  await prisma.assignment.deleteMany({
    where: {
      userId: adminUserId,
      isTemplate: true,
      difficulty: { lt: MIN_LIBRARY_DIFFICULTY },
      OR: [
        { topic: 'Servo' },
        { starterCode: { contains: '#include' } },
        { solutionCode: { contains: '#include' } },
      ],
    },
  });

  let created = 0;
  for (const entry of ASSIGNMENT_CATALOG) {
    const existing = await prisma.assignment.findFirst({
      where: { userId: adminUserId, title: entry.title, isTemplate: true },
    });

    if (existing) continue;

    await prisma.assignment.create({
      data: {
        userId: adminUserId,
        title: entry.title,
        objective: entry.objective,
        difficulty: entry.difficulty,
        topic: entry.topic || 'General',
        components: entry.components,
        instructions: entry.instructions,
        hint: entry.hint,
        starterCode: entry.starterCode,
        solutionCode: entry.solutionCode,
        testVariables: entry.testVariables,
        syntaxConcepts: entry.syntaxConcepts,
        estimatedMinutes: entry.estimatedMinutes || 15,
        isTemplate: true,
      },
    });

    created++;
  }

  return created;
}
