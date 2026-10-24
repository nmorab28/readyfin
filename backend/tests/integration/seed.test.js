import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { openDb } from '../../src/db/connection.js';
import { seedDefaultCategories } from '../../src/db/seed.js';

const EXPENSE = ['Alimentación', 'Entretenimiento', 'Otros', 'Salud', 'Servicios', 'Transporte', 'Vivienda'];
const INCOME = ['Otros', 'Regalos', 'Salario', 'Ventas'];

function namesOfType(db, type) {
  return db
    .prepare('SELECT name, is_default FROM categories WHERE type = ? ORDER BY name')
    .all(type);
}

describe('default categories seed', () => {
  let db;
  beforeEach(() => { db = openDb(':memory:'); });
  afterEach(() => db.close());

  it('creates the predefined expense and income categories on a new database', () => {
    expect(namesOfType(db, 'expense')).toEqual(EXPENSE.map((name) => ({ name, is_default: 1 })));
    expect(namesOfType(db, 'income')).toEqual(INCOME.map((name) => ({ name, is_default: 1 })));
  });

  it('does not duplicate categories when it runs again', () => {
    seedDefaultCategories(db);
    seedDefaultCategories(db);

    const { total } = db.prepare('SELECT COUNT(*) AS total FROM categories').get();
    expect(total).toBe(EXPENSE.length + INCOME.length);
  });
});
