import { Router } from 'express';

export function createTransactionRouter(service) {
  const router = Router();

  router.post('/', (req, res) => {
    res.status(201).json(service.create(req.body));
  });

  // Unfiltered for RDF-6; RDF-9 adds the month/type filter and the totals.
  router.get('/', (req, res) => {
    res.json({ items: service.list() });
  });

  return router;
}
