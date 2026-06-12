import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { closeDatabase, getDatabase, initializeSchema } from '../db/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Each vitest worker runs in its own process; give each a distinct database
// file so parallel test files do not clobber a shared SQLite file.
const workerId = process.env.VITEST_WORKER_ID ?? String(process.pid);
const testDbPath = path.join(__dirname, `../../test-grab-a-court-${workerId}.db`);

export function setupTestDatabase(): void {
  process.env.DATABASE_PATH = testDbPath;
  closeDatabase();

  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  const db = getDatabase();
  initializeSchema(db);

  const insertMember = db.prepare(
    'INSERT INTO members (name, email, role) VALUES (?, ?, ?)',
  );
  insertMember.run('Test Member', 'member@test.demo', 'member');
  insertMember.run('Test Admin', 'admin@test.demo', 'admin');

  const insertCourt = db.prepare(
    'INSERT INTO courts (name, surface_type, has_lighting, status) VALUES (?, ?, ?, ?)',
  );
  insertCourt.run('Court 1', 'Hard', 1, 'available');
  insertCourt.run('Court 2', 'Clay', 1, 'maintenance');
}

export function teardownTestDatabase(): void {
  closeDatabase();
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
}
