import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestContext } from '../helpers.js';

function categoryId(db, type, name) {
  return db.prepare('SELECT id FROM categories WHERE type = ? AND name = ?').get(type, name).id;
}

describe('RDF-9 · history filtered by month and type', () => {
  let ctx;
  let alimentacion;
  let salario;

  beforeEach(() => {
    ctx = createTestContext();
    alimentacion = categoryId(ctx.db, 'expense', 'Alimentación');
    salario = categoryId(ctx.db, 'income', 'Salario');
  });
  afterEach(() => ctx.db.close());

  const add = (type, date, amountCents) => request(ctx.app).post('/api/transactions').send({
    type, amountCents, date, categoryId: type === 'income' ? salario : alimentacion,
  });
  const list = (query) => request(ctx.app).get(`/api/transactions?${query}`);

  // Given movements in September and October, When I select October,
  // Then I only see October's, newest first.
  it('returns only the requested month, newest first, breaking ties by creation', async () => {
    await add('expense', '2026-09-30', 1000);
    const first = await add('expense', '2026-10-05', 2000);
    const second = await add('expense', '2026-10-05', 3000);
    const latest = await add('expense', '2026-10-31', 4000);
    await add('expense', '2026-11-01', 5000);

    const res = await list('month=2026-10');

    expect(res.status).toBe(200);
    expect(res.body.items.map((t) => t.id)).toEqual([latest.body.id, second.body.id, first.body.id]);
  });

  it('does not leak December into January when the month is the last of the year', async () => {
    await add('expense', '2026-12-31', 1000);
    await add('expense', '2027-01-01', 2000);

    const res = await list('month=2026-12');

    expect(res.body.items.map((t) => t.date)).toEqual(['2026-12-31']);
  });

  it('returns the totals of the month in cents', async () => {
    await add('income', '2026-10-01', 200000000);
    await add('expense', '2026-10-10', 2500000);
    await add('expense', '2026-10-11', 1000050);
    await add('expense', '2026-09-30', 999999);

    const res = await list('month=2026-10');

    expect(res.body.totals).toEqual({
      incomeCents: 200000000, expenseCents: 3500050, balanceCents: 196499950,
    });
  });

  // Given the October filter, When I select the type "Gasto",
  // Then I only see expenses and the total of expenses.
  it('filters by type; the other type counts as 0 and the balance keeps its sign', async () => {
    await add('income', '2026-10-01', 200000000);
    await add('expense', '2026-10-10', 2500000);

    const expenses = await list('month=2026-10&type=expense');
    expect(expenses.body.items.map((t) => t.type)).toEqual(['expense']);
    expect(expenses.body.totals).toEqual({ incomeCents: 0, expenseCents: 2500000, balanceCents: -2500000 });

    const incomes = await list('month=2026-10&type=income');
    expect(incomes.body.items.map((t) => t.type)).toEqual(['income']);
    expect(incomes.body.totals).toEqual({ incomeCents: 200000000, expenseCents: 0, balanceCents: 200000000 });
  });

  // Given a month without movements, Then there are no items and the totals are zero.
  it('returns no items and zero totals for a month without movements', async () => {
    await add('expense', '2026-10-10', 2500000);

    const res = await list('month=2026-08');

    expect(res.body).toEqual({ items: [], totals: { incomeCents: 0, expenseCents: 0, balanceCents: 0 } });
  });

  it('includes the category of every item', async () => {
    await add('income', '2026-10-01', 100);

    const res = await list('month=2026-10');

    expect(res.body.items[0].category).toMatchObject({ name: 'Salario', type: 'income' });
  });

  it.each([
    ['is missing', '', 'month'],
    ['is month 13', 'month=2026-13', 'month'],
    ['is month 00', 'month=2026-00', 'month'],
    ['has no leading zero', 'month=2026-1', 'month'],
    ['is not a date', 'month=octubre', 'month'],
    ['is repeated', 'month=2026-10&month=2026-11', 'month'],
    ['has an unknown type', 'month=2026-10&type=savings', 'type'],
    ['has an empty type', 'month=2026-10&type=', 'type'],
  ])('rejects the query when it %s', async (_label, query, field) => {
    const res = await list(query);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: 'VALIDATION_ERROR', field });
  });
});
