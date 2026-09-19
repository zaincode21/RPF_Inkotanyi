import app from './app.js';
import { config } from './config/env.js';
import { seedDatabase } from '../prisma/seed.js';

async function start() {
  try {
    await seedDatabase();
  } catch (err) {
    console.warn('Seed skipped or failed:', err.message);
  }

  app.listen(config.port, () => {
    console.log(`Backend running on http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
