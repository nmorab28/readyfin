import { Router } from 'express';
import { ValidationError } from '../errors.js';

const TYPES = ['income', 'expense'];

export function createCategoryRouter(categories) {
  const router = Router();

  router.get('/', (req, res) => {
    const { type } = req.query;
    if (type !== undefined && !TYPES.includes(type)) {
      throw new ValidationError('El tipo debe ser ingreso o gasto', 'type');
    }
    res.json(categories.list({ type }));
  });

  return router;
}
