import { Router } from 'express';
import {
  BookingError,
  cancelMemberReservation,
  createMemberReservation,
  listReservations,
} from '../services/bookingService.js';
import { requireDemoUser } from '../middleware/demoUser.js';
import type { CreateReservationInput } from '../types.js';

export const reservationsRouter = Router();

reservationsRouter.get('/', (req, res) => {
  const date = (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
  const reservations = listReservations(date);
  res.json({ date, reservations });
});

reservationsRouter.post('/', requireDemoUser, (req, res) => {
  try {
    const input = req.body as CreateReservationInput;
    const reservation = createMemberReservation(req.demoUser!.id, input);
    res.status(201).json({ reservation });
  } catch (error) {
    if (error instanceof BookingError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    throw error;
  }
});

reservationsRouter.delete('/:id', requireDemoUser, (req, res) => {
  try {
    const reservationId = Number(req.params.id);
    const reservation = cancelMemberReservation(req.demoUser!.id, reservationId);
    res.json({ reservation });
  } catch (error) {
    if (error instanceof BookingError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    throw error;
  }
});
