import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { todayLocal } from '../lib/dates.js';
import TransactionForm from './TransactionForm.jsx';
import TransactionList from './TransactionList.jsx';
import './transactions.css';

// `now` is injectable so tests control what "today" is.
export default function TransactionsPage({ now }) {
  const today = todayLocal(now ?? new Date());
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [listStale, setListStale] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [expenseCategories, { items }] = await Promise.all([
        api.listCategories('expense'),
        api.listTransactions(),
      ]);
      setCategories(expenseCategories);
      setTransactions(items);
      setListStale(false);
      setStatus('ready');
    } catch (err) {
      setLoadError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Errors from creating propagate to the form, which keeps what the user typed.
  // Once the expense is saved, a failed refresh must not look like a failed save.
  async function handleCreate(input) {
    await api.createTransaction(input);
    try {
      setTransactions((await api.listTransactions()).items);
      setListStale(false);
    } catch {
      setListStale(true);
    }
  }

  if (status === 'loading') return <p className="status">Cargando movimientos…</p>;

  if (status === 'error') {
    return (
      <div className="status">
        <p role="alert">{loadError}</p>
        <button type="button" onClick={load}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="transactions-page">
      <TransactionForm categories={categories} today={today} onSubmit={handleCreate} />
      <section aria-label="Historial de movimientos">
        {listStale && (
          <p role="status" className="form-error">
            El gasto se guardó, pero no se pudo actualizar la lista. <button type="button" onClick={load}>Actualizar</button>
          </p>
        )}
        <TransactionList transactions={transactions} today={today} />
      </section>
    </div>
  );
}
