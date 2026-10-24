import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors.js';
import { parseTransactionInput } from '../../src/transactions/transactions.schema.js';

const valid = { type: 'expense', amountCents: 2500000, date: '2026-10-23', categoryId: 1 };

function rejection(input) {
  try {
    parseTransactionInput(input);
  } catch (err) {
    expect(err).toBeInstanceOf(ValidationError);
    return { message: err.message, field: err.field };
  }
  throw new Error('expected the input to be rejected');
}

describe('parseTransactionInput', () => {
  it('accepts a valid expense and defaults the note to null', () => {
    expect(parseTransactionInput(valid)).toEqual({ ...valid, note: null });
  });

  it.each([
    ['missing', undefined],
    ['zero', 0],
    ['negative', -500],
    ['not a number', '25000'],
  ])('rejects an amount that is %s', (_, amountCents) => {
    expect(rejection({ ...valid, amountCents }))
      .toEqual({ message: 'El monto debe ser mayor que cero', field: 'amountCents' });
  });

  it('rejects fractional cents', () => {
    expect(rejection({ ...valid, amountCents: 10.5 }).field).toBe('amountCents');
  });

  it('accepts the maximum amount and rejects one cent more', () => {
    expect(parseTransactionInput({ ...valid, amountCents: 99999999999999 }).amountCents).toBe(99999999999999);
    expect(rejection({ ...valid, amountCents: 100000000000000 }))
      .toEqual({ message: 'El monto no puede superar $ 999.999.999.999,99', field: 'amountCents' });
  });

  it('requires a category', () => {
    expect(rejection({ ...valid, categoryId: undefined }))
      .toEqual({ message: 'La categoría es obligatoria', field: 'categoryId' });
  });

  it('requires a known movement type', () => {
    expect(rejection({ ...valid, type: 'transfer' }).field).toBe('type');
  });

  it.each(['2026-13-01', '2026-02-30', '2026-02-29', '2026-04-31', '23/10/2026', ''])(
    'rejects the invalid date %j',
    (date) => {
      expect(rejection({ ...valid, date }))
        .toEqual({ message: 'La fecha debe ser una fecha válida (AAAA-MM-DD)', field: 'date' });
    },
  );

  it('accepts 29 February in a leap year', () => {
    expect(parseTransactionInput({ ...valid, date: '2028-02-29' }).date).toBe('2028-02-29');
  });

  it('trims the note and turns a blank note into null', () => {
    expect(parseTransactionInput({ ...valid, note: '  almuerzo  ' }).note).toBe('almuerzo');
    expect(parseTransactionInput({ ...valid, note: '   ' }).note).toBeNull();
  });

  it('accepts a 200-character note and rejects 201', () => {
    expect(parseTransactionInput({ ...valid, note: 'a'.repeat(200) }).note).toHaveLength(200);
    expect(rejection({ ...valid, note: 'a'.repeat(201) }))
      .toEqual({ message: 'La nota no puede superar 200 caracteres', field: 'note' });
  });

  it('rejects fields outside the contract', () => {
    expect(rejection({ ...valid, id: 99 }))
      .toEqual({ message: 'Campo no permitido: id', field: 'id' });
  });

  it('rejects a body that is not an object', () => {
    expect(rejection(null).message).toBe('El cuerpo de la petición debe ser un objeto');
  });
});
