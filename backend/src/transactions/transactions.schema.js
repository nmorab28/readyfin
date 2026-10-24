import { z } from 'zod';
import { ValidationError } from '../errors.js';

export const MAX_AMOUNT_CENTS = 99_999_999_999_999;
const NOTE_MAX_LENGTH = 200;

const AMOUNT_POSITIVE = 'El monto debe ser mayor que cero';

const transactionInputSchema = z.strictObject(
  {
    type: z.enum(['income', 'expense'], { error: 'El tipo debe ser ingreso o gasto' }),
    amountCents: z
      .number({ error: AMOUNT_POSITIVE })
      .int({ error: 'El monto no puede tener fracciones de centavo' })
      .min(1, { error: AMOUNT_POSITIVE })
      .max(MAX_AMOUNT_CENTS, { error: 'El monto no puede superar $ 999.999.999.999,99' }),
    // Also rejects days that do not exist (2026-02-30, 2026-02-29), leap years included.
    date: z.iso.date({ error: 'La fecha debe ser una fecha válida (AAAA-MM-DD)' }),
    categoryId: z.number({ error: 'La categoría es obligatoria' }).int().positive(),
    note: z
      .string({ error: 'La nota debe ser texto' })
      .trim()
      .max(NOTE_MAX_LENGTH, { error: `La nota no puede superar ${NOTE_MAX_LENGTH} caracteres` })
      .nullish()
      .transform((note) => note || null),
  },
  { error: 'El cuerpo de la petición debe ser un objeto' },
);

// Validates a request body against contracts/openapi.yaml#TransactionInput.
// Throws a ValidationError naming the first offending field; never returns a partial value.
export function parseTransactionInput(body) {
  const result = transactionInputSchema.safeParse(body);
  if (result.success) return result.data;

  const issue = result.error.issues[0];
  if (issue.code === 'unrecognized_keys') {
    throw new ValidationError(`Campo no permitido: ${issue.keys[0]}`, issue.keys[0]);
  }
  throw new ValidationError(issue.message, issue.path[0]);
}
