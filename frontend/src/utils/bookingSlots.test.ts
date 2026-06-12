import { describe, expect, it } from 'vitest';
import type { Reservation } from '../types';
import {
  getAvailableEndTimes,
  getAvailableStartTimes,
  rangesOverlap,
} from './bookingSlots';

const reservations: Reservation[] = [
  {
    id: 1,
    court_id: 1,
    member_id: 1,
    reservation_date: '2026-06-15',
    start_time: '09:00',
    end_time: '10:00',
    status: 'confirmed',
    court_name: 'Court 1',
    member_name: 'Alex Rivera',
  },
  {
    id: 2,
    court_id: 1,
    member_id: 2,
    reservation_date: '2026-06-15',
    start_time: '11:00',
    end_time: '12:00',
    status: 'confirmed',
    court_name: 'Court 1',
    member_name: 'Jordan Kim',
  },
];

describe('bookingSlots', () => {
  it('detects overlapping ranges', () => {
    expect(rangesOverlap('09:00', '10:00', '09:30', '10:30')).toBe(true);
    expect(rangesOverlap('09:00', '10:00', '10:00', '11:00')).toBe(false);
  });

  it('excludes start times with no valid end time', () => {
    const starts = getAvailableStartTimes(1, reservations);

    expect(starts).not.toContain('09:00');
    expect(starts).toContain('10:00');
    expect(starts).not.toContain('11:00');
    expect(starts).toContain('12:00');
  });

  it('excludes end times that overlap existing reservations', () => {
    const endsFromEight = getAvailableEndTimes(1, '08:00', reservations);
    expect(endsFromEight).toEqual(['09:00']);

    const endsFromTen = getAvailableEndTimes(1, '10:00', reservations);
    expect(endsFromTen).toContain('11:00');
    expect(endsFromTen).not.toContain('12:00');
  });
});
