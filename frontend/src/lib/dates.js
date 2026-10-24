// Dates travel as 'YYYY-MM-DD' calendar days. "Today" is the user's local day:
// using toISOString() here would turn an 8 p.m. expense in Bogotá into tomorrow's.

const pad = (n) => String(n).padStart(2, '0');

export function todayLocal(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// ISO calendar strings compare correctly as plain strings.
export function isFuture(date, now = new Date()) {
  return date > todayLocal(now);
}

const shortDate = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});

// '2026-10-23' → '23 oct 2026'. Formatted in UTC because the value is a calendar day, not an instant.
export function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return shortDate
    .formatToParts(new Date(Date.UTC(year, month - 1, day)))
    .filter((part) => part.type !== 'literal')
    .map((part) => part.value.replace('.', ''))
    .join(' ');
}
