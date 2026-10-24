import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestContext } from '../helpers.js';

function categoryId(db, type, name) {
  return db.prepare('SELECT id FROM categories WHERE type = ? AND name = ?').get(type, name).id;
}

describe('RDF-6 · registering an expense', () => {
  let ctx;
  let alimentacion;
  let salario;

  beforeEach(() => {
    ctx = createTestContext();
    alimentacion = categoryId(ctx.db, 'expense', 'Alimentación');
    salario = categoryId(ctx.db, 'income', 'Salario');
  });
  afterEach(() => ctx.db.close());

  const expense = (overrides = {}) => ({
    type: 'expense', amountCents: 2500000, date: '2026-10-23', categoryId: alimentacion, ...overrides,
  });

  describe('GET /api/categories', () => {
    it('lists only expense categories, sorted by name', async () => {
      const res = await request(ctx.app).get('/api/categories?type=expense');

      expect(res.status).toBe(200);
      expect(res.body.map((c) => c.name)).toEqual([
        'Alimentación', 'Entretenimiento', 'Otros', 'Salud', 'Servicios', 'Transporte', 'Vivienda',
      ]);
      expect(res.body[0]).toEqual({ id: alimentacion, name: 'Alimentación', type: 'expense', isDefault: true });
    });

    it('rejects an unknown type', async () => {
      const res = await request(ctx.app).get('/api/categories?type=savings');

      expect(res.status).toBe(400);
      expect(res.body.error).toMatchObject({ code: 'VALIDATION_ERROR', field: 'type' });
    });
  });

  describe('POST /api/transactions', () => {
    // Given the app without movements, When I register 25.000 in Alimentación,
    // Then it appears in the list with amount, date and category.
    it('creates the expense and lists it with its category', async () => {
      const created = await request(ctx.app).post('/api/transactions').send(expense({ note: 'Mercado' }));

      expect(created.status).toBe(201);
      expect(created.body).toMatchObject({
        type: 'expense',
        amountCents: 2500000,
        date: '2026-10-23',
        note: 'Mercado',
        category: { id: alimentacion, name: 'Alimentación', type: 'expense', isDefault: true },
      });
      expect(created.body.id).toEqual(expect.any(Number));
      expect(created.body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      const list = await request(ctx.app).get('/api/transactions');
      expect(list.status).toBe(200);
      expect(list.body.items).toEqual([created.body]);
    });

    // Given the new-expense form, When the amount is empty, zero or negative, Then it is not saved.
    it.each([[undefined], [0], [-5]])('rejects the amount %j and saves nothing', async (amountCents) => {
      const res = await request(ctx.app).post('/api/transactions').send(expense({ amountCents }));

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: { code: 'VALIDATION_ERROR', message: 'El monto debe ser mayor que cero', field: 'amountCents' },
      });
      expect((await request(ctx.app).get('/api/transactions')).body.items).toEqual([]);
    });

    // Given the new-expense form, When no category is selected, Then it is not saved.
    it('requires a category', async () => {
      const res = await request(ctx.app).post('/api/transactions').send(expense({ categoryId: undefined }));

      expect(res.status).toBe(400);
      expect(res.body.error).toMatchObject({ message: 'La categoría es obligatoria', field: 'categoryId' });
    });

    it('rejects a category that does not exist', async () => {
      const res = await request(ctx.app).post('/api/transactions').send(expense({ categoryId: 9999 }));

      expect(res.status).toBe(400);
      expect(res.body.error).toMatchObject({ message: 'La categoría seleccionada no existe', field: 'categoryId' });
    });

    it('rejects an expense filed under an income category', async () => {
      const res = await request(ctx.app).post('/api/transactions').send(expense({ categoryId: salario }));

      expect(res.status).toBe(400);
      expect(res.body.error).toMatchObject({
        message: 'La categoría no corresponde al tipo de movimiento', field: 'categoryId',
      });
    });

    it('rejects a body that is not valid JSON', async () => {
      const res = await request(ctx.app)
        .post('/api/transactions')
        .set('Content-Type', 'application/json')
        .send('{"type":');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/transactions', () => {
    it('lists the newest date first and breaks ties by most recently created', async () => {
      const post = (o) => request(ctx.app).post('/api/transactions').send(expense(o));
      const older = await post({ date: '2026-10-01' });
      const sameDayFirst = await post({ date: '2026-10-20' });
      const sameDaySecond = await post({ date: '2026-10-20' });

      const res = await request(ctx.app).get('/api/transactions');

      expect(res.body.items.map((t) => t.id)).toEqual([
        sameDaySecond.body.id, sameDayFirst.body.id, older.body.id,
      ]);
    });
  });
});
