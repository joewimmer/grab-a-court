import { getDatabase } from '../db/index.js';
import { rowAs, rowsAs } from '../db/rows.js';
import type { Court, CourtStatus } from '../types.js';

export function getAllCourts(): Court[] {
  const db = getDatabase();
  return rowsAs<Court>(
    db
      .prepare(
        'SELECT id, name, surface_type, has_lighting, status, created_at FROM courts ORDER BY id',
      )
      .all(),
  );
}

export function getCourtById(id: number): Court | undefined {
  const db = getDatabase();
  return rowAs<Court>(
    db
      .prepare(
        'SELECT id, name, surface_type, has_lighting, status, created_at FROM courts WHERE id = ?',
      )
      .get(id),
  );
}

export function updateCourtStatus(id: number, status: CourtStatus): Court | undefined {
  const db = getDatabase();
  db.prepare('UPDATE courts SET status = ? WHERE id = ?').run(status, id);
  return getCourtById(id);
}
