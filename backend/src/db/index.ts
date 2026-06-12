import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');
const defaultDbPath = path.join(projectRoot, 'database', 'grab-a-court.db');
const schemaPath = path.join(projectRoot, 'database', 'schema.sql');

let db: DatabaseSync | null = null;

export function getDbPath(): string {
  return process.env.DATABASE_PATH ?? defaultDbPath;
}

export function getDatabase(): DatabaseSync {
  if (!db) {
    const dbPath = getDbPath();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    db = new DatabaseSync(dbPath);
    initializeSchema(db);
  }
  return db;
}

export function initializeSchema(database: DatabaseSync): void {
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  database.exec(schema);
}

export function resetDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
  const dbPath = getDbPath();
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  getDatabase();
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
