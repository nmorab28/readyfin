// Expected failures. Their message is safe to show to the user (contracts/openapi.yaml#Error);
// the HTTP layer decides the status code, so domain code never imports Express.
export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'El recurso solicitado no existe') {
    super(message);
    this.name = 'NotFoundError';
  }
}
