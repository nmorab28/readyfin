import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../src/App.jsx';

// App also renders the movements page, so the stub answers each endpoint it calls.
function stubApi({ healthUp }) {
  const fetchMock = vi.fn(async (url) => {
    if (url === '/api/health') {
      if (!healthUp) throw new TypeError('Failed to fetch');
      return Response.json({ status: 'ok' });
    }
    if (url.startsWith('/api/categories')) return Response.json([]);
    if (url.startsWith('/api/transactions')) {
      return Response.json({ items: [], totals: { incomeCents: 0, expenseCents: 0, balanceCents: 0 } });
    }
    throw new Error(`unexpected request to ${url}`);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('App', () => {
  it('shows that the API is connected when the health check succeeds', async () => {
    const fetchMock = stubApi({ healthUp: true });

    render(<App />);

    expect(await screen.findByText('API conectada')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/health');
  });

  it('warns the user when the API cannot be reached', async () => {
    stubApi({ healthUp: false });

    render(<App />);

    expect(await screen.findByText(/No se pudo conectar con la API/)).toHaveAttribute('role', 'alert');
  });

  // Given the app open, When I click "Categorías", Then I see the categories screen.
  it('lets the user switch between movements and categories', async () => {
    stubApi({ healthUp: true });
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Registrar gasto' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Categorías' }));

    expect(await screen.findByRole('region', { name: 'Gastos' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Registrar gasto' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Movimientos' }));

    expect(await screen.findByRole('heading', { name: 'Registrar gasto' })).toBeInTheDocument();
  });
});
