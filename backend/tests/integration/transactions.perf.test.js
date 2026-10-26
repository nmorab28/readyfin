import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestContext } from '../helpers.js';

// SC-003: the list of one month answers in under 1 second with 5.000 movements.
describe('RDF-9 · performance', () => {
  let ctx;

  beforeEach(() => { ctx = createTestContext(); });
  afterEach(() => ctx.db.close());

  it('lists one month in under 1000 ms with 5.000 movements stored', async () => {
    const category = ctx.db.prepare("SELECT id FROM categories WHERE type = 'expense' LIMIT 1").get().id;
    const insert = ctx.db.prepare(
      "INSERT INTO transactions (type, amount_cents, date, category_id) VALUES ('expense', ?, ?, ?)",
    );
    ctx.db.transaction(() => {
      for (let i = 0; i < 5000; i += 1) {
        const month = String((i % 12) + 1).padStart(2, '0');
        const day = String((i % 28) + 1).padStart(2, '0');
        insert.run(1000 + i, `2026-${month}-${day}`, category);
      }
    })();

    const started = performance.now();
    const res = await request(ctx.app).get('/api/transactions?month=2026-10');
    const elapsed = performance.now() - started;

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(400);
    expect(res.body.items.every((t) => t.date.startsWith('2026-10'))).toBe(true);
    expect(elapsed).toBeLessThan(1000);
  });
});
