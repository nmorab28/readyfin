import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestContext } from '../helpers.js';

describe('GET /api/health', () => {
  let ctx;
  beforeEach(() => { ctx = createTestContext(); });
  afterEach(() => ctx.db.close());

  it('responds ok when the API is up', async () => {
    const res = await request(ctx.app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
