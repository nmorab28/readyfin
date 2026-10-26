import { useEffect, useState } from 'react';
import CategoriesPage from './categories/CategoriesPage.jsx';
import TransactionsPage from './transactions/TransactionsPage.jsx';

function useApiHealth() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let ignore = false;
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((body) => { if (!ignore) setStatus(body.status === 'ok' ? 'up' : 'down'); })
      .catch(() => { if (!ignore) setStatus('down'); });
    return () => { ignore = true; };
  }, []);

  return status;
}

const VIEWS = [
  { id: 'transactions', label: 'Movimientos' },
  { id: 'categories', label: 'Categorías' },
];

export default function App() {
  const apiStatus = useApiHealth();
  const [view, setView] = useState('transactions');

  return (
    <main className="app">
      <header className="app-header">
        <h1>ReadyFin</h1>
        {apiStatus === 'up' && <p className="api-status api-status--up">API conectada</p>}
        {apiStatus === 'down' && (
          <p role="alert" className="api-status api-status--down">
            No se pudo conectar con la API. Revisa que el backend esté en ejecución.
          </p>
        )}
      </header>
      <nav className="app-nav" aria-label="Secciones">
        {VIEWS.map(({ id, label }) => (
          <button
            key={id} type="button" onClick={() => setView(id)}
            aria-current={view === id ? 'page' : undefined}
          >
            {label}
          </button>
        ))}
      </nav>
      {view === 'transactions' ? <TransactionsPage /> : <CategoriesPage />}
    </main>
  );
}
