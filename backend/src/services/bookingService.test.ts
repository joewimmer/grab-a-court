import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getDatabase } from '../db/index.js';
import { setupTestDatabase, teardownTestDatabase } from '../test/helpers.js';
import {
  assertAdmin,
  assertMemberCanBook,
  BookingError,
  cancelMemberReservation,
  createMemberReservation,
  getCourtStatusBoard,
  listReservations,
  setCourtStatus,
  validateReservationInput,
  validateTimeRange,
} from './bookingService.js';
import type { Member } from '../types.js';

const MEMBER_ID = 1;
const ADMIN_ID = 2;

function bookCourt1(memberId = MEMBER_ID, date = '2026-06-15') {
  return createMemberReservation(memberId, {
    court_id: 1,
    reservation_date: date,
    start_time: '09:00',
    end_time: '10:00',
  });
}

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

  describe('validateReservationInput', () => {
    it('rejects missing required fields', () => {
      expect(() =>
        validateReservationInput({
          court_id: 0,
          reservation_date: '',
          start_time: '',
          end_time: '',
        }),
      ).toThrow('Court, date, start time, and end time are required.');
    });

    it('rejects an invalid date format', () => {
      expect(() =>
        validateReservationInput({
          court_id: 1,
          reservation_date: '06/15/2026',
          start_time: '09:00',
          end_time: '10:00',
        }),
      ).toThrow('YYYY-MM-DD');
    });

    it('rejects an invalid time format', () => {
      expect(() =>
        validateReservationInput({
          court_id: 1,
          reservation_date: '2026-06-15',
          start_time: '9am',
          end_time: '10am',
        }),
      ).toThrow('HH:MM');
    });

    it('accepts a valid input', () => {
      expect(() =>
        validateReservationInput({
          court_id: 1,
          reservation_date: '2026-06-15',
          start_time: '09:00',
          end_time: '10:00',
        }),
      ).not.toThrow();
    });
  });

  describe('role assertions', () => {
    it('allows members and admins to book', () => {
      expect(() =>
        assertMemberCanBook({ role: 'member' } as Member),
      ).not.toThrow();
      expect(() => assertMemberCanBook({ role: 'admin' } as Member)).not.toThrow();
    });

    it('rejects unknown roles', () => {
      expect(() =>
        assertMemberCanBook({ role: 'guest' } as unknown as Member),
      ).toThrow(BookingError);
    });

    it('rejects non-admins from admin actions', () => {
      expect(() => assertAdmin({ role: 'member' } as Member)).toThrow(
        'Admin access required.',
      );
      expect(() => assertAdmin({ role: 'admin' } as Member)).not.toThrow();
    });
  });

  describe('createMemberReservation', () => {
    it('creates a reservation for an available court', () => {
      const reservation = bookCourt1();
      expect(reservation.court_name).toBe('Court 1');
      expect(reservation.member_name).toBe('Test Member');
      expect(reservation.status).toBe('confirmed');
    });

    it('rejects an unknown member', () => {
      expect(() => bookCourt1(999)).toThrow('Member not found.');
    });

    it('rejects an unknown court', () => {
      expect(() =>
        createMemberReservation(MEMBER_ID, {
          court_id: 999,
          reservation_date: '2026-06-15',
          start_time: '09:00',
          end_time: '10:00',
        }),
      ).toThrow('Court not found.');
    });

    it('rejects overlapping reservations', () => {
      bookCourt1();
      expect(() =>
        createMemberReservation(MEMBER_ID, {
          court_id: 1,
          reservation_date: '2026-06-15',
          start_time: '09:30',
          end_time: '10:30',
        }),
      ).toThrow('already has a reservation');
    });

    it('rejects reservations on maintenance courts', () => {
      expect(() =>
        createMemberReservation(MEMBER_ID, {
          court_id: 2,
          reservation_date: '2026-06-15',
          start_time: '09:00',
          end_time: '10:00',
        }),
      ).toThrow('maintenance');
    });
  });

  describe('cancelMemberReservation', () => {
    it('lets the owner cancel their reservation', () => {
      const reservation = bookCourt1();
      const cancelled = cancelMemberReservation(MEMBER_ID, reservation.id);
      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.court_name).toBe('Court 1');
    });

    it('lets an admin cancel any reservation', () => {
      const reservation = bookCourt1();
      const cancelled = cancelMemberReservation(ADMIN_ID, reservation.id);
      expect(cancelled.status).toBe('cancelled');
    });

    it('rejects an unknown member', () => {
      const reservation = bookCourt1();
      expect(() => cancelMemberReservation(999, reservation.id)).toThrow(
        'Member not found.',
      );
    });

    it('rejects an unknown reservation', () => {
      expect(() => cancelMemberReservation(MEMBER_ID, 999)).toThrow(
        'Reservation not found.',
      );
    });

    it('rejects cancelling an already-cancelled reservation', () => {
      const reservation = bookCourt1();
      cancelMemberReservation(MEMBER_ID, reservation.id);
      expect(() => cancelMemberReservation(MEMBER_ID, reservation.id)).toThrow(
        'already cancelled',
      );
    });

    it('prevents a non-owner member from cancelling', () => {
      const reservation = bookCourt1(MEMBER_ID);
      // Seed a second member to act as a non-owner.
      const otherMemberId = 3;
      setupOtherMember(otherMemberId);
      expect(() => cancelMemberReservation(otherMemberId, reservation.id)).toThrow(
        'only cancel your own',
      );
    });
  });

  describe('listReservations', () => {
    it('lists confirmed reservations for a date', () => {
      bookCourt1(MEMBER_ID, '2026-06-20');
      const reservations = listReservations('2026-06-20');
      expect(reservations).toHaveLength(1);
      expect(reservations[0].court_name).toBe('Court 1');
    });
  });

  describe('getCourtStatusBoard', () => {
    it('returns a view for every court', () => {
      const board = getCourtStatusBoard('2026-06-20');
      expect(board).toHaveLength(2);
      expect(board[0]).toMatchObject({ name: 'Court 1', status: 'available' });
      expect(typeof board[0].has_lighting).toBe('boolean');
    });

    it('lists upcoming reservations for a future date', () => {
      bookCourt1(MEMBER_ID, '2030-01-01');
      const board = getCourtStatusBoard('2030-01-01');
      const court1 = board.find((c) => c.id === 1)!;
      expect(court1.upcoming_reservations).toHaveLength(1);
      expect(court1.upcoming_reservations[0].member_name).toBe('Test Member');
    });
  });

  describe('setCourtStatus', () => {
    it('lets an admin update court status', () => {
      const court = setCourtStatus(ADMIN_ID, 1, 'maintenance');
      expect(court.status).toBe('maintenance');
    });

    it('rejects a non-admin', () => {
      expect(() => setCourtStatus(MEMBER_ID, 1, 'maintenance')).toThrow(
        'Admin access required.',
      );
    });

    it('rejects an unknown admin', () => {
      expect(() => setCourtStatus(999, 1, 'maintenance')).toThrow(
        'Member not found.',
      );
    });

    it('rejects an unknown court', () => {
      expect(() => setCourtStatus(ADMIN_ID, 999, 'maintenance')).toThrow(
        'Court not found.',
      );
    });

    it('rejects an invalid status', () => {
      expect(() =>
        setCourtStatus(ADMIN_ID, 1, 'broken' as never),
      ).toThrow('Invalid court status.');
    });
  });
});

function setupOtherMember(id: number): void {
  // Insert a third member directly so we have a distinct non-owner.
  const db = getDatabase();
  db.prepare('INSERT INTO members (id, name, email, role) VALUES (?, ?, ?, ?)').run(
    id,
    'Other Member',
    'other@test.demo',
    'member',
  );
}
