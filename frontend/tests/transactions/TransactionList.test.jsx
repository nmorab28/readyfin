import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TransactionList from '../../src/transactions/TransactionList.jsx';

const alimentacion = { id: 1, name: 'Alimentación', type: 'expense', isDefault: true };
const tx = (overrides) => ({
  id: 1, type: 'expense', amountCents: 2500000, date: '2026-10-23', categoryId: 1, note: null,
  createdAt: '2026-10-23T15:00:00.000Z', category: alimentacion, ...overrides,
});

describe('TransactionList', () => {
  it('shows date, category, note and formatted amount', () => {
    render(<TransactionList transactions={[tx({ note: 'Mercado' })]} today="2026-10-23" />);

    const row = screen.getByRole('row', { name: /Alimentación/ });
    expect(within(row).getByText('23 oct 2026')).toBeInTheDocument();
    expect(within(row).getByText('Mercado')).toBeInTheDocument();
    expect(within(row).getByText(/25\.000/)).toBeInTheDocument();
  });

  it('marks movements dated after today as future', () => {
    render(<TransactionList transactions={[tx({ date: '2026-11-01' })]} today="2026-10-23" />);

    expect(screen.getByText('Futuro')).toBeInTheDocument();
  });

  it('says there are no movements in the period when the list is empty', () => {
    render(<TransactionList transactions={[]} today="2026-10-23" />);

    expect(screen.getByText('No hay movimientos en este periodo')).toBeInTheDocument();
  });
});
