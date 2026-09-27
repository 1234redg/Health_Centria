import mongoose from 'mongoose';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

async function main() {
  // Atlas is optional for /api/health liveness; warn instead of crashing
  // when MONGODB_URI is still the placeholder.
  const isPlaceholder = env.MONGODB_URI.includes('<user>');
  if (isPlaceholder) {
    console.warn('MONGODB_URI is a placeholder — starting API without DB connection.');
  } else {
    try {
      await connectDB(env.MONGODB_URI);
    } catch (err) {
      console.error('Failed to connect to MongoDB Atlas:', err);
      process.exit(1);
    }
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async () => {
    console.log('Shutting down...');
    server.close(async () => {
      if (mongoose.connection.readyState === 1) await mongoose.disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main();
