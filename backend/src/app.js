import express from 'express';
import { createCategoryRepository } from './categories/categories.repository.js';
import { createCategoryRouter } from './categories/categories.routes.js';
import { createErrorHandler, logErrorToConsole, notFoundHandler } from './http/errors.js';
import { createTransactionRepository } from './transactions/transactions.repository.js';
import { createTransactionRouter } from './transactions/transactions.routes.js';
import { createTransactionService } from './transactions/transactions.service.js';

// The database is injected so tests can run against ':memory:'.
// `extraRoutes` lets tests mount throwaway routes to exercise the error handler.
export function createApp(db, { extraRoutes, logError = logErrorToConsole } = {}) {
  const app = express();
  const api = express.Router();

  const categories = createCategoryRepository(db);
  const transactions = createTransactionService({
    transactions: createTransactionRepository(db),
    categories,
  });

  app.use(express.json({ limit: '10kb' }));

  api.get('/health', (req, res) => res.json({ status: 'ok' }));
  api.use('/categories', createCategoryRouter(categories));
  api.use('/transactions', createTransactionRouter(transactions));
  if (extraRoutes) extraRoutes(api);

  api.use(notFoundHandler);
  app.use('/api', api);
  app.use(createErrorHandler(logError));

  return app;
}
