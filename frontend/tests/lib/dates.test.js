import { describe, expect, it } from 'vitest';
import { formatDate, isFuture, todayLocal } from '../../src/lib/dates.js';

describe('todayLocal', () => {
  it('uses the local calendar day, not the UTC one', () => {
    // 20:00 on 23 Oct in Bogotá is already 01:00 on 24 Oct in UTC.
    const eveningInBogota = new Date('2026-10-24T01:00:00Z');

    expect(todayLocal(eveningInBogota)).toBe('2026-10-23');
  });

  it('pads month and day', () => {
    expect(todayLocal(new Date(2026, 0, 5, 12))).toBe('2026-01-05');
  });
});

describe('isFuture', () => {
  const now = new Date(2026, 9, 23, 12);

  it('is true only for days after today', () => {
    expect(isFuture('2026-10-24', now)).toBe(true);
    expect(isFuture('2026-10-23', now)).toBe(false);
    expect(isFuture('2026-10-22', now)).toBe(false);
  });
});

describe('formatDate', () => {
  it('shows an ISO date as a short Spanish date', () => {
    expect(formatDate('2026-10-23')).toBe('23 oct 2026');
  });
});
