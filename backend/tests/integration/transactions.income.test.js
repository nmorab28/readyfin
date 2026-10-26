import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestContext } from '../helpers.js';

function categoryId(db, type, name) {
  return db.prepare('SELECT id FROM categories WHERE type = ? AND name = ?').get(type, name).id;
}

describe('RDF-7 · registering an income', () => {
  let ctx;
  let salario;
  let alimentacion;

  beforeEach(() => {
    ctx = createTestContext();
    salario = categoryId(ctx.db, 'income', 'Salario');
    alimentacion = categoryId(ctx.db, 'expense', 'Alimentación');
  });
  afterEach(() => ctx.db.close());

  const income = (overrides = {}) => ({
    type: 'income', amountCents: 200000000, date: '2026-10-23', categoryId: salario, ...overrides,
  });

  // Given the form switched to "Ingreso", only income categories are offered.
  it('lists only income categories, sorted by name', async () => {
    const res = await request(ctx.app).get('/api/categories?type=income');

    expect(res.status).toBe(200);
    expect(res.body.map((c) => c.name)).toEqual(['Otros', 'Regalos', 'Salario', 'Ventas']);
    expect(res.body.every((c) => c.type === 'income')).toBe(true);
  });

  // Given the app open, When I register an income of 2.000.000 in Salario,
  // Then it appears in the list identified as an income.
  it('creates the income and lists it with type income', async () => {
    const created = await request(ctx.app).post('/api/transactions').send(income({ note: 'Quincena' }));

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      type: 'income',
      amountCents: 200000000,
      note: 'Quincena',
      category: { id: salario, name: 'Salario', type: 'income', isDefault: true },
    });

    const list = await request(ctx.app).get('/api/transactions?month=2026-10');
    expect(list.body.items).toEqual([created.body]);
  });

  it('rejects an income filed under an expense category', async () => {
    const res = await request(ctx.app).post('/api/transactions').send(income({ categoryId: alimentacion }));

    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({
      message: 'La categoría no corresponde al tipo de movimiento', field: 'categoryId',
    });
    expect((await request(ctx.app).get('/api/transactions?month=2026-10')).body.items).toEqual([]);
  });

  it.each([[0], [-1]])('rejects an income with the amount %j', async (amountCents) => {
    const res = await request(ctx.app).post('/api/transactions').send(income({ amountCents }));

    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ message: 'El monto debe ser mayor que cero', field: 'amountCents' });
  });
});
