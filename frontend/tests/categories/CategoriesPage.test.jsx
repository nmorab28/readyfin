import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CategoriesPage from '../../src/categories/CategoriesPage.jsx';

const expenses = [
  { id: 1, name: 'Alimentación', type: 'expense', isDefault: true },
  { id: 2, name: 'Transporte', type: 'expense', isDefault: true },
  { id: 20, name: 'Mascotas', type: 'expense', isDefault: false },
];
const incomes = [
  { id: 8, name: 'Salario', type: 'income', isDefault: true },
  { id: 9, name: 'Ventas', type: 'income', isDefault: true },
];

function stubApi() {
  const fetchMock = vi.fn(async (url) => {
    if (url === '/api/categories?type=expense') return Response.json(expenses);
    if (url === '/api/categories?type=income') return Response.json(incomes);
    return Response.json({ error: { code: 'NOT_FOUND', message: 'no' } }, { status: 404 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('CategoriesPage (RDF-8)', () => {
  // Given a fresh install, When I open "Categorías", Then I see them split into
  // "Gastos" and "Ingresos".
  it('shows the categories split into Gastos and Ingresos', async () => {
    stubApi();
    render(<CategoriesPage />);

    const gastos = await screen.findByRole('region', { name: 'Gastos' });
    const ingresos = screen.getByRole('region', { name: 'Ingresos' });

    expect(within(gastos).getAllByRole('listitem').map((li) => li.textContent))
      .toEqual([expect.stringContaining('Alimentación'), expect.stringContaining('Transporte'), expect.stringContaining('Mascotas')]);
    expect(within(ingresos).getByText('Salario')).toBeInTheDocument();
    expect(within(ingresos).getByText('Ventas')).toBeInTheDocument();
    expect(within(gastos).queryByText('Salario')).not.toBeInTheDocument();
  });

  // Given the list, Then predefined categories are told apart from custom ones.
  it('marks predefined and custom categories differently', async () => {
    stubApi();
    render(<CategoriesPage />);

    const gastos = await screen.findByRole('region', { name: 'Gastos' });
    const alimentacion = within(gastos).getByText('Alimentación').closest('li');
    const mascotas = within(gastos).getByText('Mascotas').closest('li');

    expect(within(alimentacion).getByText('Predefinida')).toBeInTheDocument();
    expect(within(mascotas).getByText('Personalizada')).toBeInTheDocument();
    expect(within(mascotas).queryByText('Predefinida')).not.toBeInTheDocument();
  });

  it('tells the user when the categories cannot be loaded and lets them retry', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch'); }));
    const user = userEvent.setup();
    render(<CategoriesPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor');

    stubApi();
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('region', { name: 'Gastos' })).toBeInTheDocument();
  });
});
