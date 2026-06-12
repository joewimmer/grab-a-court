import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setupTestDatabase, teardownTestDatabase } from '../test/helpers.js';
import {
  BookingError,
  createMemberReservation,
  validateTimeRange,
} from './bookingService.js';

describe('bookingService', () => {
  beforeEach(() => {
    setupTestDatabase();
  });

  afterEach(() => {
    teardownTestDatabase();
  });

  describe('validateTimeRange', () => {
    it('rejects end time before start time', () => {
      expect(() => validateTimeRange('10:00', '09:00')).toThrow(BookingError);
    });

    it('rejects times outside operating hours', () => {
      expect(() => validateTimeRange('06:00', '08:00')).toThrow(BookingError);
      expect(() => validateTimeRange('20:00', '22:00')).toThrow(BookingError);
    });

    it('accepts valid time ranges', () => {
      expect(() => validateTimeRange('09:00', '10:30')).not.toThrow();
    });
  });

  describe('createMemberReservation', () => {
    it('creates a reservation for an available court', () => {
      const reservation = createMemberReservation(1, {
        court_id: 1,
        reservation_date: '2026-06-15',
        start_time: '09:00',
        end_time: '10:00',
      });

      expect(reservation.court_name).toBe('Court 1');
      expect(reservation.member_name).toBe('Test Member');
      expect(reservation.status).toBe('confirmed');
    });

    it('rejects overlapping reservations', () => {
      createMemberReservation(1, {
        court_id: 1,
        reservation_date: '2026-06-15',
        start_time: '09:00',
        end_time: '10:00',
      });

      expect(() =>
        createMemberReservation(1, {
          court_id: 1,
          reservation_date: '2026-06-15',
          start_time: '09:30',
          end_time: '10:30',
        }),
      ).toThrow(BookingError);
    });

    it('rejects reservations on maintenance courts', () => {
      expect(() =>
        createMemberReservation(1, {
          court_id: 2,
          reservation_date: '2026-06-15',
          start_time: '09:00',
          end_time: '10:00',
        }),
      ).toThrow(BookingError);
    });
  });
});
