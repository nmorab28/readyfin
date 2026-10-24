import { formatDate } from '../lib/dates.js';
import { formatCents } from '../lib/money.js';

export default function TransactionList({ transactions, today }) {
  if (transactions.length === 0) {
    return <p className="empty">Aún no has registrado movimientos</p>;
  }

  return (
    <table className="transaction-list">
      <caption>Movimientos</caption>
      <thead>
        <tr>
          <th scope="col">Fecha</th>
          <th scope="col">Categoría</th>
          <th scope="col">Nota</th>
          <th scope="col" className="amount">Monto</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <tr key={t.id}>
            <td>
              <span>{formatDate(t.date)}</span>
              {t.date > today && <span className="tag">Futuro</span>}
            </td>
            <td>{t.category.name}</td>
            <td>{t.note}</td>
            <td className="amount">{formatCents(t.amountCents)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
