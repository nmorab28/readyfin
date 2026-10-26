import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TransactionsPage from '../../src/transactions/TransactionsPage.jsx';

const alimentacion = { id: 1, name: 'Alimentación', type: 'expense', isDefault: true };
const salario = { id: 8, name: 'Salario', type: 'income', isDefault: true };
const allCategories = [alimentacion, salario];

// A tiny in-memory stand-in for the API, so the page is exercised through real fetch calls.
// It filters by month and type and sums the totals like the real endpoint does.
function stubApi({ transactions = [] } = {}) {
  const store = [...transactions];
  const fetchMock = vi.fn(async (url, options = {}) => {
    const { pathname, searchParams } = new URL(url, 'http://localhost');
    if (pathname === '/api/categories') return Response.json(allCategories);
    if (pathname === '/api/transactions' && options.method === 'POST') {
      const input = JSON.parse(options.body);
      const created = { id: store.length + 1, ...input, category: allCategories.find((c) => c.id === input.categoryId), createdAt: '2026-10-23T15:00:00.000Z' };
      store.unshift(created);
      return Response.json(created, { status: 201 });
    }
    if (pathname === '/api/transactions') {
      const month = searchParams.get('month');
      const type = searchParams.get('type');
      const items = store.filter((t) => t.date.startsWith(month) && (!type || t.type === type));
      const sum = (kind) => items.filter((t) => t.type === kind).reduce((total, t) => total + t.amountCents, 0);
      const totals = { incomeCents: sum('income'), expenseCents: sum('expense') };
      return Response.json({ items, totals: { ...totals, balanceCents: totals.incomeCents - totals.expenseCents } });
    }
    return Response.json({ error: { code: 'NOT_FOUND', message: 'no' } }, { status: 404 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const tx = (overrides) => ({
  id: 1, type: 'expense', amountCents: 2500000, date: '2026-10-10', categoryId: 1, note: null,
  createdAt: '2026-10-10T15:00:00.000Z', category: alimentacion, ...overrides,
});

describe('TransactionsPage (RDF-6)', () => {
  // Given the app without movements, When I register an expense of 25.000 dated today in
  // Alimentación, Then it appears in the list with amount, date and category.
  it('registers an expense and shows it in the list', async () => {
    stubApi();
    const user = userEvent.setup();
    render(<TransactionsPage now={new Date(2026, 9, 23, 10)} />);

    expect(await screen.findByText('No hay movimientos en este periodo')).toBeInTheDocument();

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

    await screen.findByText('No hay movimientos en este periodo');
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

describe('TransactionsPage · period filter (RDF-9)', () => {
  const now = new Date(2026, 9, 23, 10); // 23 Oct 2026
  const seed = [
    tx({ id: 1, date: '2026-09-15', amountCents: 1000000, note: 'de septiembre' }),
    tx({ id: 2, date: '2026-10-10', amountCents: 2500000, note: 'gasto octubre' }),
    tx({
      id: 3, type: 'income', date: '2026-10-01', amountCents: 200000000, categoryId: 8,
      category: salario, note: 'ingreso octubre',
    }),
  ];

  // Given movements in September and October, When the current month is October,
  // Then I only see October's.
  it('opens on the current month and shows only its movements with the totals', async () => {
    stubApi({ transactions: seed });
    render(<TransactionsPage now={now} />);

    expect(await screen.findByText('gasto octubre')).toBeInTheDocument();
    expect(screen.getByText('ingreso octubre')).toBeInTheDocument();
    expect(screen.queryByText('de septiembre')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Mes')).toHaveValue('2026-10');
    const totals = within(screen.getByLabelText('Totales del periodo'));
    expect(totals.getByText('Ingresos').nextSibling).toHaveTextContent(/2\.000\.000/);
    expect(totals.getByText('Gastos').nextSibling).toHaveTextContent(/25\.000/);
    expect(totals.getByText('Saldo').nextSibling).toHaveTextContent(/1\.975\.000/);
  });

  it('shows the movements of another month when it is selected', async () => {
    stubApi({ transactions: seed });
    render(<TransactionsPage now={now} />);
    await screen.findByText('gasto octubre');

    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '2026-09' } });

    expect(await screen.findByText('de septiembre')).toBeInTheDocument();
    expect(screen.queryByText('gasto octubre')).not.toBeInTheDocument();
  });

  // Given the October filter, When I select the type "Gasto", Then I only see expenses
  // and the total of expenses.
  it('filters by type and shows only the total of that type', async () => {
    stubApi({ transactions: seed });
    const user = userEvent.setup();
    render(<TransactionsPage now={now} />);
    await screen.findByText('gasto octubre');

    await user.selectOptions(screen.getByLabelText('Filtrar por tipo'), 'Gastos');

    await waitFor(() => expect(screen.queryByText('ingreso octubre')).not.toBeInTheDocument());
    expect(screen.getByText('gasto octubre')).toBeInTheDocument();
    const totals = within(screen.getByLabelText('Totales del periodo'));
    expect(totals.getByText('Total de gastos').nextSibling).toHaveTextContent(/25\.000/);
    expect(totals.queryByText('Saldo')).not.toBeInTheDocument();
  });

  // Given a month without movements, When I select it, Then I see the empty message.
  it('says so when the selected month has no movements', async () => {
    stubApi({ transactions: seed });
    render(<TransactionsPage now={now} />);
    await screen.findByText('gasto octubre');

    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '2026-08' } });

    expect(await screen.findByText('No hay movimientos en este periodo')).toBeInTheDocument();
  });

  it('keeps what the user typed in the form while the filter changes', async () => {
    stubApi({ transactions: seed });
    const user = userEvent.setup();
    render(<TransactionsPage now={now} />);
    await screen.findByText('gasto octubre');

    await user.type(screen.getByLabelText('Monto'), '30.000');
    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '2026-09' } });
    await screen.findByText('de septiembre');

    expect(screen.getByLabelText('Monto')).toHaveValue('30.000');
  });

  it('refreshes the list of the selected month after saving a movement', async () => {
    stubApi({ transactions: seed });
    const user = userEvent.setup();
    render(<TransactionsPage now={now} />);
    await screen.findByText('gasto octubre');

    await user.type(screen.getByLabelText('Monto'), '7.000');
    await user.selectOptions(screen.getByLabelText('Categoría'), 'Alimentación');
    await user.type(screen.getByLabelText('Nota (opcional)'), 'recién guardado');
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }));

    expect(await screen.findByText('recién guardado')).toBeInTheDocument();
  });

  it('tells the user the movement was saved when only the refresh fails', async () => {
    const fetchMock = stubApi({ transactions: seed });
    const user = userEvent.setup();
    render(<TransactionsPage now={now} />);
    await screen.findByText('gasto octubre');

    const working = fetchMock.getMockImplementation();
    fetchMock.mockImplementation(async (url, options) => {
      if (options?.method === 'POST') return working(url, options);
      throw new TypeError('Failed to fetch');
    });
    await user.type(screen.getByLabelText('Monto'), '7.000');
    await user.selectOptions(screen.getByLabelText('Categoría'), 'Alimentación');
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }));

    expect(await screen.findByText(/El movimiento se guardó, pero no se pudo actualizar la lista/)).toBeInTheDocument();
    expect(screen.getByLabelText('Monto')).toHaveValue('');
  });
});
