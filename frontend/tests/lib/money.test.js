import { describe, expect, it } from 'vitest';
import { formatCents, parseCopToCents } from '../../src/lib/money.js';

// Intl separates the symbol with a non-breaking space; compare with a plain one.
const plain = (text) => text.replace(/ /g, ' ');

describe('parseCopToCents', () => {
  it.each([
    ['25000', 2500000],
    ['25.000', 2500000],
    ['2.000.000', 200000000],
    ['1.234,5', 123450],
    ['1234,56', 123456],
    ['$ 25.000,00', 2500000],
    ['  25.000  ', 2500000],
    ['0', 0],
    ['-5', -500],
  ])('reads %j as %d cents', (text, cents) => {
    expect(parseCopToCents(text)).toBe(cents);
  });

  it.each(['', '   ', 'abc', '1,234', '25.00', '1.23.456', '12,3,4', '25.000,'])(
    'returns null for the malformed amount %j',
    (text) => {
      expect(parseCopToCents(text)).toBeNull();
    },
  );
});

describe('formatCents', () => {
  it('formats whole pesos with thousands separators and no decimals', () => {
    expect(plain(formatCents(2500000))).toBe('$ 25.000');
    expect(plain(formatCents(200000000))).toBe('$ 2.000.000');
  });

  it('keeps the cents when there are any', () => {
    expect(plain(formatCents(123450))).toBe('$ 1.234,50');
  });
});
