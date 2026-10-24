// Amounts travel and are stored as integer cents (constitution, principle IV).
// This module is the only place that knows how Colombians write and read money.

export const MAX_AMOUNT_CENTS = 99_999_999_999_999;

// es-CO: "." groups thousands (always in threes) and "," separates up to two decimals.
const AMOUNT_PATTERN = /^(-)?(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/;

// Returns the amount in cents, or null when the text is not a number written the es-CO way.
// Range checks (> 0, maximum) are the caller's business rule, not a parsing concern.
export function parseCopToCents(text) {
  const match = AMOUNT_PATTERN.exec(text.replace(/[$\s]/g, ''));
  if (!match) return null;

  const [, minus, pesos, decimals = ''] = match;
  const cents = Number(pesos.replaceAll('.', '')) * 100 + Number(decimals.padEnd(2, '0'));
  return minus ? -cents : cents;
}

const wholePesos = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0,
});
const withCents = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2,
});

export function formatCents(cents) {
  const formatter = cents % 100 === 0 ? wholePesos : withCents;
  return formatter.format(cents / 100);
}
