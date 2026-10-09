import type { Reservation } from '../types';

/** Longest single reservation, in minutes. Exactly this length is allowed. */
export const MAX_BOOKING_MINUTES = 3 * 60;

export const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00',
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

export function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA < endB && endA > startB;
}

function getCourtReservations(
  courtId: number,
  reservationDate: string,
  reservations: Reservation[],
): Reservation[] {
  return reservations.filter(
    (r) => r.court_id === courtId && r.reservation_date === reservationDate,
  );
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function rangeOverlapsReservation(
  startTime: string,
  endTime: string,
  reservations: Reservation[],
): boolean {
  return reservations.some((reservation) =>
    rangesOverlap(
      startTime,
      endTime,
      reservation.start_time,
      reservation.end_time,
    ),
  );
}

function isBookableRange(
  startTime: string,
  endTime: string,
  reservations: Reservation[],
): boolean {
  const duration = timeToMinutes(endTime) - timeToMinutes(startTime);
  return (
    duration > 0 &&
    duration <= MAX_BOOKING_MINUTES &&
    !rangeOverlapsReservation(startTime, endTime, reservations)
  );
}

export function getAvailableStartTimes(
  courtId: number,
  reservationDate: string,
  reservations: Reservation[],
): string[] {
  const courtReservations = getCourtReservations(
    courtId,
    reservationDate,
    reservations,
  );

  return TIME_SLOTS.filter((startTime) =>
    TIME_SLOTS.some((endTime) =>
      isBookableRange(startTime, endTime, courtReservations),
    ),
  );
}

export function getAvailableEndTimes(
  courtId: number,
  startTime: string,
  reservationDate: string,
  reservations: Reservation[],
): string[] {
  const courtReservations = getCourtReservations(
    courtId,
    reservationDate,
    reservations,
  );

  return TIME_SLOTS.filter((endTime) =>
    isBookableRange(startTime, endTime, courtReservations),
  );
}
