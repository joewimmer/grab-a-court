import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setupTestDatabase, teardownTestDatabase } from '../test/helpers.js';
import {
  createReservation,
  hasOverlappingReservation,
} from './reservationRepository.js';

describe('reservationRepository.hasOverlappingReservation', () => {
  beforeEach(() => {
    setupTestDatabase();
    createReservation(1, {
      court_id: 1,
      reservation_date: '2026-06-15',
      start_time: '09:00',
      end_time: '10:00',
    });
  });

  afterEach(() => {
    teardownTestDatabase();
  });

  it('detects an overlapping reservation', () => {
    expect(hasOverlappingReservation(1, '2026-06-15', '09:30', '10:30')).toBe(true);
  });

  it('returns false for a non-overlapping time slot', () => {
    expect(
      hasOverlappingReservation(1, '2026-06-15', '10:00', '11:00'),
    ).toBe(false);
  });

  it('excludes a given reservation id from the overlap check', () => {
    const existing = createReservation(1, {
      court_id: 1,
      reservation_date: '2026-06-16',
      start_time: '09:00',
      end_time: '10:00',
    });

    expect(
      hasOverlappingReservation(1, '2026-06-16', '09:00', '10:00', existing.id),
    ).toBe(false);
    expect(hasOverlappingReservation(1, '2026-06-16', '09:00', '10:00')).toBe(true);
  });
});
