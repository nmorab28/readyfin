import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TransactionsPage from '../../src/transactions/TransactionsPage.jsx';

const alimentacion = { id: 1, name: 'Alimentación', type: 'expense', isDefault: true };
const salario = { id: 8, name: 'Salario', type: 'income', isDefault: true };
const allCategories = [alimentacion, salario];

// A tiny in-memory stand-in for the API, so the page is exercised through real fetch calls.
function stubApi({ transactions = [] } = {}) {
  const store = [...transactions];
  const fetchMock = vi.fn(async (url, options = {}) => {
    if (url === '/api/categories') return Response.json(allCategories);
    if (url === '/api/transactions' && options.method === 'POST') {
      const input = JSON.parse(options.body);
      const created = { id: store.length + 1, ...input, category: allCategories.find((c) => c.id === input.categoryId), createdAt: '2026-10-23T15:00:00.000Z' };
      store.unshift(created);
      return Response.json(created, { status: 201 });
    }
    if (url === '/api/transactions') return Response.json({ items: store });
    return Response.json({ error: { code: 'NOT_FOUND', message: 'no' } }, { status: 404 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('TransactionsPage (RDF-6)', () => {
  // Given the app without movements, When I register an expense of 25.000 dated today in
  // Alimentación, Then it appears in the list with amount, date and category.
  it('registers an expense and shows it in the list', async () => {
    stubApi();
    const user = userEvent.setup();
    render(<TransactionsPage now={new Date(2026, 9, 23, 10)} />);

    expect(await screen.findByText('Aún no has registrado movimientos')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Monto'), '25.000');
    await user.selectOptions(screen.getByLabelText('Categoría'), 'Alimentación');
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }));

    const row = await screen.findByRole('row', { name: /Alimentación/ });
    expect(within(row).getByText('23 oct 2026')).toBeInTheDocument();
    expect(within(row).getByText(/25\.000/)).toBeInTheDocument();
  });

  // Given the app open, When I register an income of 2.000.000 in Salario,
  // Then it appears in the list identified as an income (+ and income colour).
  it('registers an income and shows it marked as income', async () => {
    stubApi();
    const user = userEvent.setup();
    render(<TransactionsPage now={new Date(2026, 9, 23, 10)} />);

    await screen.findByText('Aún no has registrado movimientos');
    await user.selectOptions(screen.getByLabelText('Tipo'), 'Ingreso');
    await user.type(screen.getByLabelText('Monto'), '2.000.000');
    await user.selectOptions(screen.getByLabelText('Categoría'), 'Salario');
    await user.click(screen.getByRole('button', { name: 'Guardar ingreso' }));

    const row = await screen.findByRole('row', { name: /Salario/ });
    const amountCell = within(row).getByText(/2\.000\.000/);
    expect(amountCell.textContent.startsWith('+')).toBe(true);
    expect(amountCell).toHaveClass('amount--income');
  });

  it('tells the user when the movements cannot be loaded', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch'); }));
    render(<TransactionsPage now={new Date(2026, 9, 23, 10)} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor');
  });
});
