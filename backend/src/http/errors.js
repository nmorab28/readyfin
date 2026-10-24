import { randomBytes } from 'node:crypto';
import { NotFoundError, ValidationError } from '../errors.js';

export function notFoundHandler(req, res, next) {
  next(new NotFoundError());
}

// Unexpected errors never reach the user: they get a reference to quote, the log gets the stack.
export function createErrorHandler(logError) {
  // Express recognises error middleware by its four parameters, so `next` must stay.
  return function errorHandler(err, req, res, next) {
    if (err instanceof ValidationError) {
      const error = { code: 'VALIDATION_ERROR', message: err.message };
      if (err.field) error.field = err.field;
      return res.status(400).json({ error });
    }
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: err.message } });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'El cuerpo de la petición no es JSON válido' },
      });
    }

    const reference = randomBytes(4).toString('hex');
    logError({ reference, route: `${req.method} ${req.originalUrl.split('?')[0]}`, error: err });
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: `Ocurrió un error inesperado. Referencia: ${reference}` },
    });
  };
}

export function logErrorToConsole({ reference, route, error }) {
  console.error(JSON.stringify({
    level: 'error',
    event: 'http.unhandled_error',
    reference,
    route,
    error: { name: error.name, message: error.message, stack: error.stack },
  }));
}
