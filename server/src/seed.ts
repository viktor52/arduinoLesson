import bcrypt from 'bcrypt';
import { prisma } from './lib/prisma';
import { seedAchievements } from './services/progressService';
import { seedAssignmentCatalog } from './services/catalogSeedService';
import { ASSIGNMENT_CATALOG } from './data/assignmentCatalog';

async function seed() {
  console.log('Seeding database...');

  await seedAchievements();

  const adminEmail = 'admin@arduino.dev';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!admin) {
    const passwordHash = await bcrypt.hash('admin12345', 12);
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        username: 'admin',
        passwordHash,
        displayName: 'Admin',
        role: 'ADMIN',
        xp: 1000,
        level: 5,
      },
    });
    console.log('Created admin user: admin@arduino.dev / admin12345');
  }

  const demoEmail = 'demo@arduino.dev';
  const existingDemo = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!existingDemo) {
    const passwordHash = await bcrypt.hash('demo12345', 12);
    await prisma.user.create({
      data: {
        email: demoEmail,
        username: 'demo',
        passwordHash,
        displayName: 'Demo Student',
        xp: 250,
        level: 2,
        streak: 3,
        completedAssignments: 5,
        averageScore: 82,
      },
    });
    console.log('Created demo user: demo@arduino.dev / demo12345');
  }

  const catalogCount = await seedAssignmentCatalog(admin.id);
  console.log(`Seeded ${catalogCount} new catalog assignments (${ASSIGNMENT_CATALOG.length} total in catalog)`);

  console.log('Seed completed!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
