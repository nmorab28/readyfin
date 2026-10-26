import { Router } from 'express';

export function createTransactionRouter(service) {
  const router = Router();

  router.post('/', (req, res) => {
    res.status(201).json(service.create(req.body));
  });

  // RDF-9: movements of one month, optionally of one type, with their totals.
  router.get('/', (req, res) => {
    res.json(service.list(req.query));
  });

  return router;
}
