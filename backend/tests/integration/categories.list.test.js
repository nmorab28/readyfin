import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestContext } from '../helpers.js';

describe('RDF-8 · viewing categories', () => {
  let ctx;

  beforeEach(() => { ctx = createTestContext(); });
  afterEach(() => ctx.db.close());

  // Given a fresh install, When I open "Categorías", Then I see the 7 expense and 4 income
  // predefined categories.
  it('lists the predefined categories of both types on a fresh install', async () => {
    const res = await request(ctx.app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body.filter((c) => c.type === 'expense')).toHaveLength(7);
    expect(res.body.filter((c) => c.type === 'income')).toHaveLength(4);
    expect(res.body.every((c) => c.isDefault === true)).toBe(true);
  });

  // Given the list, Then predefined categories are told apart from custom ones.
  it('flags a category that is not predefined with isDefault false', async () => {
    ctx.db.prepare("INSERT INTO categories (name, type, is_default) VALUES ('Mascotas', 'expense', 0)").run();

    const res = await request(ctx.app).get('/api/categories?type=expense');

    expect(res.body.find((c) => c.name === 'Mascotas')).toMatchObject({ type: 'expense', isDefault: false });
    expect(res.body.find((c) => c.name === 'Alimentación').isDefault).toBe(true);
  });
});
