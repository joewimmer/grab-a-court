import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDatabase, getDatabase, getDbPath, resetDatabase } from './index.js';

const tmpDbPath = path.join(os.tmpdir(), `grab-a-court-db-test-${process.pid}.db`);

describe('db/index', () => {
  beforeEach(() => {
    process.env.DATABASE_PATH = tmpDbPath;
    closeDatabase();
    if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath);
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath);
    delete process.env.DATABASE_PATH;
  });

  it('returns the configured database path', () => {
    expect(getDbPath()).toBe(tmpDbPath);
  });

  it('reuses a single database instance', () => {
    const first = getDatabase();
    const second = getDatabase();
    expect(first).toBe(second);
  });

  it('recreates the database file on reset', () => {
    getDatabase();
    expect(fs.existsSync(tmpDbPath)).toBe(true);

    resetDatabase();
    expect(fs.existsSync(tmpDbPath)).toBe(true);

    // The schema should be present after a reset.
    const db = getDatabase();
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all() as Array<{ name: string }>;
    const tableNames = tables.map((t) => t.name);
    expect(tableNames).toContain('courts');
    expect(tableNames).toContain('reservations');
  });
});
