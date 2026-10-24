import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import { seedDefaultCategories } from './seed.js';

const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');

// Opens a ready-to-use database: schema applied and default categories present.
// Pass ':memory:' for tests.
export function openDb(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });

  const db = new Database(path);
  db.pragma('foreign_keys = ON');
  db.exec(schema);
  seedDefaultCategories(db);
  return db;
}
