import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL }));
  app.use(express.json());
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.use('/api', apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
