import cors from 'cors';
import express from 'express';
import { healthRouter } from './routes/health.js';
import { membersRouter } from './routes/members.js';
import { courtsRouter } from './routes/courts.js';
import { reservationsRouter } from './routes/reservations.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api', healthRouter);
  app.use('/api/members', membersRouter);
  app.use('/api/courts', courtsRouter);
  app.use('/api/reservations', reservationsRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}
