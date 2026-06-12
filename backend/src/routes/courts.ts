import { Router } from 'express';
import { BookingError, getCourtStatusBoard, setCourtStatus } from '../services/bookingService.js';
import { requireDemoUser } from '../middleware/demoUser.js';
import type { CourtStatus } from '../types.js';

export const courtsRouter = Router();

courtsRouter.get('/status', (req, res) => {
  const date = (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
  const courts = getCourtStatusBoard(date);
  res.json({ date, courts });
});

courtsRouter.patch('/:id/status', requireDemoUser, (req, res) => {
  try {
    const courtId = Number(req.params.id);
    const { status } = req.body as { status?: CourtStatus };

    if (!status) {
      res.status(400).json({ error: 'Status is required.' });
      return;
    }

    const court = setCourtStatus(req.demoUser!.id, courtId, status);
    res.json({ court });
  } catch (error) {
    if (error instanceof BookingError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    throw error;
  }
});
