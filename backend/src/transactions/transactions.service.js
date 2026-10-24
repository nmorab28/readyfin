import { ValidationError } from '../errors.js';
import { parseTransactionInput } from './transactions.schema.js';

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
    list() {
      return transactions.listAll();
    },
  };
}
