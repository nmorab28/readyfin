import express from 'express';
import { createErrorHandler, logErrorToConsole, notFoundHandler } from './http/errors.js';

// The database is injected so tests can run against ':memory:'.
// `extraRoutes` lets tests mount throwaway routes to exercise the error handler.
export function createApp(db, { extraRoutes, logError = logErrorToConsole } = {}) {
  const app = express();
  const api = express.Router();

  app.use(express.json({ limit: '10kb' }));

  api.get('/health', (req, res) => res.json({ status: 'ok' }));
  if (extraRoutes) extraRoutes(api);

  api.use(notFoundHandler);
  app.use('/api', api);
  app.use(createErrorHandler(logError));

  return app;
}
