import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import './categories.css';

const GROUPS = [
  { type: 'expense', title: 'Gastos' },
  { type: 'income', title: 'Ingresos' },
];

function CategoryGroup({ title, categories }) {
  const headingId = `categories-${title.toLowerCase()}`;
  return (
    <section aria-labelledby={headingId} className="category-group">
      <h2 id={headingId}>{title}</h2>
      {categories.length === 0 ? (
        <p className="empty">No hay categorías de este tipo</p>
      ) : (
        <ul className="category-list">
          {categories.map((c) => (
            <li key={c.id}>
              <span>{c.name}</span>
              <span className={`tag ${c.isDefault ? 'tag--default' : 'tag--custom'}`}>
                {c.isDefault ? 'Predefinida' : 'Personalizada'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Read-only list of categories grouped by type (RDF-8). Creating and editing come in later stories.
export default function CategoriesPage() {
  const [byType, setByType] = useState({ expense: [], income: [] });
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [expense, income] = await Promise.all([
        api.listCategories('expense'),
        api.listCategories('income'),
      ]);
      setByType({ expense, income });
      setStatus('ready');
    } catch (err) {
      setLoadError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (status === 'loading') return <p className="status">Cargando categorías…</p>;

  if (status === 'error') {
    return (
      <div className="status">
        <p role="alert">{loadError}</p>
        <button type="button" onClick={load}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="categories-page">
      {GROUPS.map(({ type, title }) => (
        <CategoryGroup key={type} title={title} categories={byType[type]} />
      ))}
    </div>
  );
}
