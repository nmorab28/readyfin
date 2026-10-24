import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../src/App.jsx';

function stubFetch(impl) {
  const fetchMock = vi.fn(impl);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('App', () => {
  it('shows that the API is connected when the health check succeeds', async () => {
    const fetchMock = stubFetch(async () => Response.json({ status: 'ok' }));

    render(<App />);

    expect(await screen.findByText('API conectada')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/health');
  });

  it('warns the user when the API cannot be reached', async () => {
    stubFetch(async () => { throw new TypeError('Failed to fetch'); });

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con la API');
  });
});
