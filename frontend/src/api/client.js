// Thin wrapper over the REST contract (specs/001-registro-movimientos/contracts/openapi.yaml).
// Every failure becomes an ApiError whose message is safe to show to the user.

const NETWORK_MESSAGE = 'No se pudo conectar con el servidor. Intenta de nuevo.';
const UNEXPECTED_MESSAGE = 'Ocurrió un error inesperado. Intenta de nuevo.';

export class ApiError extends Error {
  constructor(message, { code, field, cause } = {}) {
    super(message, { cause });
    this.name = 'ApiError';
    this.code = code;
    this.field = field;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const options = body === undefined
    ? undefined
    : { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };

  let response;
  try {
    response = await fetch(path, options);
  } catch (cause) {
    throw new ApiError(NETWORK_MESSAGE, { code: 'NETWORK_ERROR', cause });
  }

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);
  if (response.ok && payload !== null) return payload;

  const error = payload?.error;
  if (error?.message) throw new ApiError(error.message, { code: error.code, field: error.field });
  throw new ApiError(UNEXPECTED_MESSAGE, { code: 'INTERNAL_ERROR' });
}

export const api = {
  // Without `type` the API returns the categories of both types.
  listCategories: (type) => request(type ? `/api/categories?type=${encodeURIComponent(type)}` : '/api/categories'),
  // `month` is 'YYYY-MM'; `type` is optional and left out of the URL when empty.
  listTransactions: ({ month, type } = {}) => {
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (type) params.set('type', type);
    return request(`/api/transactions?${params}`);
  },
  createTransaction: (input) => request('/api/transactions', { method: 'POST', body: input }),
};
