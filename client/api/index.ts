import type { VercelRequest, VercelResponse } from '@vercel/node';

// Server build output is CommonJS; Vercel compiles this file as CJS so require works.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createApp } = require('../../server/dist/app');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { seedAchievements } = require('../../server/dist/services/progressService');

const app = createApp();

let ready: Promise<void> | null = null;

function ensureReady(): Promise<void> {
  if (!ready) {
    ready = seedAchievements().catch((err: unknown) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureReady();
  return app(req, res);
}
