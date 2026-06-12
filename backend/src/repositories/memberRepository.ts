import { getDatabase } from '../db/index.js';
import { rowAs, rowsAs } from '../db/rows.js';
import type { Member } from '../types.js';

export function getAllMembers(): Member[] {
  const db = getDatabase();
  return rowsAs<Member>(
    db.prepare('SELECT id, name, email, role, created_at FROM members ORDER BY name').all(),
  );
}

export function getMemberById(id: number): Member | undefined {
  const db = getDatabase();
  return rowAs<Member>(
    db.prepare('SELECT id, name, email, role, created_at FROM members WHERE id = ?').get(id),
  );
}

export function getDemoMembers(): Member[] {
  return getAllMembers();
}
