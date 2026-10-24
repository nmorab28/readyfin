import { useEffect, useState } from 'react';

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

export default function App() {
  const apiStatus = useApiHealth();

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
    </main>
  );
}
