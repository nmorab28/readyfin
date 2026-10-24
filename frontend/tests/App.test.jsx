import { render, screen } from '@testing-library/react';
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
    if (url === '/api/transactions') return Response.json({ items: [] });
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
});
