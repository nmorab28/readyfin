const SELECT_WITH_CATEGORY = `
  SELECT t.id, t.type, t.amount_cents, t.date, t.category_id, t.note, t.created_at,
         c.name AS category_name, c.type AS category_type, c.is_default AS category_is_default
  FROM transactions t
  JOIN categories c ON c.id = t.category_id`;

// Same shape as contracts/openapi.yaml#Transaction.
function toTransaction(row) {
  return {
    id: row.id,
    type: row.type,
    amountCents: row.amount_cents,
    date: row.date,
    categoryId: row.category_id,
    note: row.note,
    createdAt: row.created_at,
    category: {
      id: row.category_id,
      name: row.category_name,
      type: row.category_type,
      isDefault: row.category_is_default === 1,
    },
  };
}

// 'YYYY-MM' → [first day of the month, first day of the next one). A half-open range keeps the
// last day of the month in and works with idx_transactions_date; December rolls into January.
function monthRange(month) {
  const [year, number] = month.split('-').map(Number);
  const next = number === 12 ? `${year + 1}-01` : `${year}-${String(number + 1).padStart(2, '0')}`;
  return { from: `${month}-01`, to: `${next}-01` };
}

export function createTransactionRepository(db) {
  const insertRow = db.prepare(`
    INSERT INTO transactions (type, amount_cents, date, category_id, note)
    VALUES (@type, @amountCents, @date, @categoryId, @note)`);
  const byId = db.prepare(`${SELECT_WITH_CATEGORY} WHERE t.id = ?`);
  const inPeriod = db.prepare(`
    ${SELECT_WITH_CATEGORY}
    WHERE t.date >= @from AND t.date < @to AND (@type IS NULL OR t.type = @type)
    ORDER BY t.date DESC, t.id DESC`);
  // Sums happen in SQL over integer cents, so they match the manual sum to the cent.
  const totalsInPeriod = db.prepare(`
    SELECT type, SUM(amount_cents) AS total
    FROM transactions
    WHERE date >= @from AND date < @to AND (@type IS NULL OR type = @type)
    GROUP BY type`);

  function findById(id) {
    const row = byId.get(id);
    return row ? toTransaction(row) : null;
  }

  return {
    insert(transaction) {
      const { lastInsertRowid } = insertRow.run(transaction);
      return findById(lastInsertRowid);
    },
    findById,
    // Shape of contracts/openapi.yaml: items plus totals of exactly those items. The type that was
    // filtered out counts as 0, so the balance of an expense-only view is negative.
    listByPeriod({ month, type }) {
      const params = { ...monthRange(month), type: type ?? null };
      const byType = Object.fromEntries(totalsInPeriod.all(params).map((row) => [row.type, row.total]));
      const incomeCents = byType.income ?? 0;
      const expenseCents = byType.expense ?? 0;
      return {
        items: inPeriod.all(params).map(toTransaction),
        totals: { incomeCents, expenseCents, balanceCents: incomeCents - expenseCents },
      };
    },
  };
}
