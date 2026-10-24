import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { openDb } from '../../src/db/connection.js';
import { createApp } from '../../src/app.js';

describe('API error responses', () => {
  let db;
  beforeEach(() => { db = openDb(':memory:'); });
  afterEach(() => db.close());

  it('returns the contract NOT_FOUND shape for an unknown API route', async () => {
    const res = await request(createApp(db)).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'El recurso solicitado no existe' },
    });
  });

  it('hides internal details when an unexpected error happens', async () => {
    const app = createApp(db, {
      extraRoutes: (router) => {
        router.get('/boom', () => { throw new Error('SQLITE_CORRUPT: table transactions'); });
      },
      logError: () => {},
    });

    const res = await request(app).get('/api/boom');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(res.body.error.message).toMatch(/^Ocurrió un error inesperado\. Referencia: [0-9a-f]{8}$/);
    expect(JSON.stringify(res.body)).not.toContain('SQLITE');
  });

  it('logs the unexpected error with the same reference the user sees', async () => {
    const logged = [];
    const app = createApp(db, {
      extraRoutes: (router) => {
        router.get('/boom', () => { throw new Error('disk full'); });
      },
      logError: (entry) => logged.push(entry),
    });

    const res = await request(app).get('/api/boom');

    const reference = res.body.error.message.split('Referencia: ')[1];
    expect(logged).toHaveLength(1);
    expect(logged[0]).toMatchObject({ reference, route: 'GET /api/boom' });
    expect(logged[0].error.message).toBe('disk full');
  });
});
