import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'grab-a-court-api',
    timestamp: new Date().toISOString(),
  });
});
