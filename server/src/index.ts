import { createApp } from './app';
import { config } from './config';
import { prisma } from './lib/prisma';
import { seedAchievements } from './services/progressService';

async function main() {
  await seedAchievements();

  const app = createApp();

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} (${config.nodeEnv})`);
  });
}

main().catch(async (err) => {
  console.error('Failed to start server:', err);
  await prisma.$disconnect();
  process.exit(1);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
