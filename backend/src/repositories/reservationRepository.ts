import { getDatabase } from '../db/index.js';
import { rowAs, rowsAs } from '../db/rows.js';
import type {
  CreateReservationInput,
  Reservation,
  ReservationWithDetails,
} from '../types.js';

export function getReservationsByDate(date: string): ReservationWithDetails[] {
  const db = getDatabase();
  return rowsAs<ReservationWithDetails>(
    db.prepare(
      `SELECT
        r.id,
        r.court_id,
        r.member_id,
        r.reservation_date,
        r.start_time,
        r.end_time,
        r.status,
        r.created_at,
        c.name AS court_name,
        m.name AS member_name
      FROM reservations r
      JOIN courts c ON c.id = r.court_id
      JOIN members m ON m.id = r.member_id
      WHERE r.reservation_date = ? AND r.status = 'confirmed'
      ORDER BY r.start_time, c.name`,
    ).all(date),
  );
}

export function getReservationsForCourtOnDate(
  courtId: number,
  date: string,
): ReservationWithDetails[] {
  const db = getDatabase();
  return rowsAs<ReservationWithDetails>(
    db.prepare(
      `SELECT
        r.id,
        r.court_id,
        r.member_id,
        r.reservation_date,
        r.start_time,
        r.end_time,
        r.status,
        r.created_at,
        c.name AS court_name,
        m.name AS member_name
      FROM reservations r
      JOIN courts c ON c.id = r.court_id
      JOIN members m ON m.id = r.member_id
      WHERE r.court_id = ? AND r.reservation_date = ? AND r.status = 'confirmed'
      ORDER BY r.start_time`,
    ).all(courtId, date),
  );
}

export function getReservationById(id: number): Reservation | undefined {
  const db = getDatabase();
  return rowAs<Reservation>(
    db
      .prepare(
        'SELECT id, court_id, member_id, reservation_date, start_time, end_time, status, created_at FROM reservations WHERE id = ?',
      )
      .get(id),
  );
}

export function createReservation(
  memberId: number,
  input: CreateReservationInput,
): Reservation {
  const db = getDatabase();
  const result = db
    .prepare(
      `INSERT INTO reservations (court_id, member_id, reservation_date, start_time, end_time)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      input.court_id,
      memberId,
      input.reservation_date,
      input.start_time,
      input.end_time,
    );

  return getReservationById(Number(result.lastInsertRowid))!;
}

export function cancelReservation(id: number): Reservation | undefined {
  const db = getDatabase();
  db.prepare("UPDATE reservations SET status = 'cancelled' WHERE id = ?").run(id);
  return getReservationById(id);
}

export function hasOverlappingReservation(
  courtId: number,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: number,
): boolean {
  const db = getDatabase();
  const query = `
    SELECT COUNT(*) AS count
    FROM reservations
    WHERE court_id = ?
      AND reservation_date = ?
      AND status = 'confirmed'
      AND start_time < ?
      AND end_time > ?
      ${excludeId ? 'AND id != ?' : ''}
  `;

  const params = excludeId
    ? [courtId, date, endTime, startTime, excludeId]
    : [courtId, date, endTime, startTime];

  const row = rowAs<{ count: number }>(db.prepare(query).get(...params));
  return (row?.count ?? 0) > 0;
}
