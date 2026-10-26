import { formatCents } from '../lib/money.js';

// With a type filter only that type's total is meaningful; without one the user sees the month's balance.
function rowsFor(type, { incomeCents, expenseCents, balanceCents }) {
  if (type === 'expense') return [['Total de gastos', expenseCents, 'expense']];
  if (type === 'income') return [['Total de ingresos', incomeCents, 'income']];
  return [
    ['Ingresos', incomeCents, 'income'],
    ['Gastos', expenseCents, 'expense'],
    ['Saldo', balanceCents, balanceCents < 0 ? 'expense' : 'income'],
  ];
}

export default function PeriodTotals({ type, totals }) {
  return (
    <dl className="period-totals" aria-label="Totales del periodo">
      {rowsFor(type, totals).map(([label, cents, tone]) => (
        <div key={label} className="period-total">
          <dt>{label}</dt>
          <dd className={`amount--${tone}`}>{formatCents(cents)}</dd>
        </div>
      ))}
    </dl>
  );
}
