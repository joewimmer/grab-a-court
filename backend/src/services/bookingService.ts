import { OPERATING_HOURS } from '../config.js';
import { getCourtById, updateCourtStatus } from '../repositories/courtRepository.js';
import { getMemberById } from '../repositories/memberRepository.js';
import {
  cancelReservation,
  createReservation,
  getReservationById,
  getReservationsByDate,
  getReservationsForCourtOnDate,
  hasOverlappingReservation,
} from '../repositories/reservationRepository.js';
import type {
  CourtStatus,
  CourtStatusView,
  CreateReservationInput,
  Member,
  ReservationWithDetails,
} from '../types.js';
import { getAllCourts } from '../repositories/courtRepository.js';

export class BookingError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'BookingError';
  }
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function validateTimeRange(startTime: string, endTime: string): void {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const open = timeToMinutes(OPERATING_HOURS.open);
  const close = timeToMinutes(OPERATING_HOURS.close);

  if (start >= end) {
    throw new BookingError('End time must be after start time.');
  }

  if (start < open || end > close) {
    throw new BookingError(
      `Reservations must be between ${OPERATING_HOURS.open} and ${OPERATING_HOURS.close}.`,
    );
  }
}

export function validateReservationInput(input: CreateReservationInput): void {
  if (!input.court_id || !input.reservation_date || !input.start_time || !input.end_time) {
    throw new BookingError('Court, date, start time, and end time are required.');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.reservation_date)) {
    throw new BookingError('Reservation date must be in YYYY-MM-DD format.');
  }

  if (!/^\d{2}:\d{2}$/.test(input.start_time) || !/^\d{2}:\d{2}$/.test(input.end_time)) {
    throw new BookingError('Times must be in HH:MM format.');
  }

  validateTimeRange(input.start_time, input.end_time);
}

export function assertMemberCanBook(member: Member): void {
  if (member.role !== 'member' && member.role !== 'admin') {
    throw new BookingError('Invalid member role.', 403);
  }
}

export function assertAdmin(member: Member): void {
  if (member.role !== 'admin') {
    throw new BookingError('Admin access required.', 403);
  }
}

export function createMemberReservation(
  memberId: number,
  input: CreateReservationInput,
): ReservationWithDetails {
  const member = getMemberById(memberId);
  if (!member) {
    throw new BookingError('Member not found.', 404);
  }

  assertMemberCanBook(member);
  validateReservationInput(input);

  const court = getCourtById(input.court_id);
  if (!court) {
    throw new BookingError('Court not found.', 404);
  }

  if (court.status !== 'available') {
    throw new BookingError(`Court is currently ${court.status}.`, 409);
  }

  if (
    hasOverlappingReservation(
      input.court_id,
      input.reservation_date,
      input.start_time,
      input.end_time,
    )
  ) {
    throw new BookingError('This court already has a reservation during that time.', 409);
  }

  const reservation = createReservation(memberId, input);
  return {
    ...reservation,
    court_name: court.name,
    member_name: member.name,
  };
}

export function cancelMemberReservation(
  memberId: number,
  reservationId: number,
): ReservationWithDetails {
  const member = getMemberById(memberId);
  if (!member) {
    throw new BookingError('Member not found.', 404);
  }

  const reservation = getReservationById(reservationId);
  if (!reservation) {
    throw new BookingError('Reservation not found.', 404);
  }

  if (reservation.status === 'cancelled') {
    throw new BookingError('Reservation is already cancelled.');
  }

  const isOwner = reservation.member_id === memberId;
  const isAdmin = member.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new BookingError('You can only cancel your own reservations.', 403);
  }

  const cancelled = cancelReservation(reservationId)!;
  const court = getCourtById(cancelled.court_id)!;
  const reservationMember = getMemberById(cancelled.member_id)!;

  return {
    ...cancelled,
    court_name: court.name,
    member_name: reservationMember.name,
  };
}

export function getCourtStatusBoard(date: string): CourtStatusView[] {
  const courts = getAllCourts();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return courts.map((court) => {
    const reservations = getReservationsForCourtOnDate(court.id, date);

    let currentReservation: CourtStatusView['current_reservation'] = null;

    if (date === today) {
      const active = reservations.find(
        (r) => r.start_time <= currentTime && r.end_time > currentTime,
      );
      if (active) {
        currentReservation = {
          id: active.id,
          member_name: active.member_name,
          start_time: active.start_time,
          end_time: active.end_time,
        };
      }
    }

    const upcoming = reservations
      .filter((r) => {
        if (date !== today) return true;
        return r.start_time > currentTime;
      })
      .slice(0, 3)
      .map((r) => ({
        id: r.id,
        member_name: r.member_name,
        start_time: r.start_time,
        end_time: r.end_time,
      }));

    return {
      id: court.id,
      name: court.name,
      surface_type: court.surface_type,
      has_lighting: court.has_lighting === 1,
      status: court.status,
      current_reservation: currentReservation,
      upcoming_reservations: upcoming,
    };
  });
}

export function listReservations(date: string): ReservationWithDetails[] {
  return getReservationsByDate(date);
}

export function setCourtStatus(
  adminId: number,
  courtId: number,
  status: CourtStatus,
): CourtStatusView {
  const admin = getMemberById(adminId);
  if (!admin) {
    throw new BookingError('Member not found.', 404);
  }

  assertAdmin(admin);

  const court = getCourtById(courtId);
  if (!court) {
    throw new BookingError('Court not found.', 404);
  }

  if (!['available', 'maintenance', 'unavailable'].includes(status)) {
    throw new BookingError('Invalid court status.');
  }

  updateCourtStatus(courtId, status);
  const today = new Date().toISOString().slice(0, 10);
  const board = getCourtStatusBoard(today);
  return board.find((c) => c.id === courtId)!;
}
