import { ValidationError } from '../errors.js';
import { parseTransactionInput } from './transactions.schema.js';

const TYPES = ['income', 'expense'];
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

// Business rules for movements. Storage is injected, so this module knows nothing about SQL or HTTP.
export function createTransactionService({ transactions, categories }) {
  function assertCategoryMatches(input) {
    const category = categories.findById(input.categoryId);
    if (!category) {
      throw new ValidationError('La categoría seleccionada no existe', 'categoryId');
    }
    if (category.type !== input.type) {
      throw new ValidationError('La categoría no corresponde al tipo de movimiento', 'categoryId');
    }
  }

  return {
    create(body) {
      const input = parseTransactionInput(body);
      assertCategoryMatches(input);
      return transactions.insert(input);
    },
    // `query` comes straight from the URL, so every value is untrusted (it may even be an array).
    list({ month, type } = {}) {
      if (typeof month !== 'string' || !MONTH_PATTERN.test(month)) {
        throw new ValidationError('El mes es obligatorio y debe tener el formato AAAA-MM', 'month');
      }
      if (type !== undefined && !TYPES.includes(type)) {
        throw new ValidationError('El tipo debe ser ingreso o gasto', 'type');
      }
      return transactions.listByPeriod({ month, type });
    },
  };
}
