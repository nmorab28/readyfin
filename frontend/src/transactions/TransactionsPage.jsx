import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { todayLocal } from '../lib/dates.js';
import PeriodFilter from './PeriodFilter.jsx';
import PeriodTotals from './PeriodTotals.jsx';
import TransactionForm from './TransactionForm.jsx';
import TransactionList from './TransactionList.jsx';
import './transactions.css';

const NO_TOTALS = { incomeCents: 0, expenseCents: 0, balanceCents: 0 };
const SAVED_BUT_STALE = 'El movimiento se guardó, pero no se pudo actualizar la lista.';

// `now` is injectable so tests control what "today" is.
export default function TransactionsPage({ now }) {
  const today = todayLocal(now ?? new Date());
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);

  // The list has its own status: changing the filter must never unmount the form,
  // or whatever the user was typing would be lost.
  const [filter, setFilter] = useState({ month: today.slice(0, 7), type: '' });
  const [period, setPeriod] = useState({ items: [], totals: NO_TOTALS });
  const [listStatus, setListStatus] = useState('loading');
  const [listError, setListError] = useState(null);
  // `afterSave` tells a refresh that failed after a successful save apart from a plain failure.
  const [reload, setReload] = useState({ count: 0, afterSave: false });

  const loadCategories = useCallback(async () => {
    setStatus('loading');
    try {
      setCategories(await api.listCategories());
      setStatus('ready');
    } catch (err) {
      setLoadError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  useEffect(() => {
    let ignore = false;
    setListStatus('loading');
    api.listTransactions(filter)
      .then((result) => { if (!ignore) { setPeriod(result); setListStatus('ready'); } })
      .catch((err) => {
        if (ignore) return;
        setListError(reload.afterSave ? SAVED_BUT_STALE : err.message);
        setListStatus('error');
      });
    // A response for a month the user already left must not overwrite the current one.
    return () => { ignore = true; };
  }, [filter, reload]);

  function handleFilterChange(next) {
    setReload((current) => (current.afterSave ? { ...current, afterSave: false } : current));
    setFilter(next);
  }

  // Errors from creating propagate to the form, which keeps what the user typed.
  // Once the movement is saved, a failed refresh must not look like a failed save.
  async function handleCreate(input) {
    await api.createTransaction(input);
    setReload((current) => ({ count: current.count + 1, afterSave: true }));
  }

  if (status === 'loading') return <p className="status">Cargando movimientos…</p>;

  if (status === 'error') {
    return (
      <div className="status">
        <p role="alert">{loadError}</p>
        <button type="button" onClick={loadCategories}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="transactions-page">
      <TransactionForm categories={categories} today={today} onSubmit={handleCreate} />
      <section aria-label="Historial de movimientos">
        <PeriodFilter month={filter.month} type={filter.type} onChange={handleFilterChange} />
        {listStatus === 'error' ? (
          <div className="status">
            <p role="alert">{listError}</p>
            <button type="button" onClick={() => setReload((c) => ({ ...c, count: c.count + 1 }))}>Reintentar</button>
          </div>
        ) : (
          <>
            <PeriodTotals type={filter.type} totals={period.totals} />
            {listStatus === 'loading' && period.items.length === 0
              ? <p className="status">Cargando movimientos…</p>
              : <TransactionList transactions={period.items} today={today} />}
          </>
        )}
      </section>
    </div>
  );
}
