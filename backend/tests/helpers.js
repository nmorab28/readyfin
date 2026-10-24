import { openDb } from '../src/db/connection.js';
import { createApp } from '../src/app.js';

// Each test gets its own in-memory database, so tests never share state or order.
export function createTestContext() {
  const db = openDb(':memory:');
  const app = createApp(db);
  return { db, app };
}
