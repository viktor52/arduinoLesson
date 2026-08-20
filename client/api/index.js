const { createApp } = require('../../server/dist/app');
const { seedAchievements } = require('../../server/dist/services/progressService');

const app = createApp();

let ready = null;

function ensureReady() {
  if (!ready) {
    ready = seedAchievements().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

module.exports = async function handler(req, res) {
  await ensureReady();
  return app(req, res);
};
