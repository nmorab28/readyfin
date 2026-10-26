const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

// Controlled filter: the page owns `month` ('YYYY-MM') and `type` ('' = all, 'expense', 'income').
export default function PeriodFilter({ month, type, onChange }) {
  // A half-typed or cleared month would only make the API answer 400, so it is not reported.
  function handleMonth(event) {
    const value = event.target.value;
    if (MONTH_PATTERN.test(value)) onChange({ month: value, type });
  }

  return (
    <div className="period-filter">
      <div className="field">
        <label htmlFor="filter-month">Mes</label>
        <input
          id="filter-month" type="month" placeholder="AAAA-MM" value={month} onChange={handleMonth}
        />
      </div>
      <div className="field">
        <label htmlFor="filter-type">Filtrar por tipo</label>
        <select id="filter-type" value={type} onChange={(e) => onChange({ month, type: e.target.value })}>
          <option value="">Todos</option>
          <option value="expense">Gastos</option>
          <option value="income">Ingresos</option>
        </select>
      </div>
    </div>
  );
}
