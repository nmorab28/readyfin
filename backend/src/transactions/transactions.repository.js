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

export function createTransactionRepository(db) {
  const insertRow = db.prepare(`
    INSERT INTO transactions (type, amount_cents, date, category_id, note)
    VALUES (@type, @amountCents, @date, @categoryId, @note)`);
  const byId = db.prepare(`${SELECT_WITH_CATEGORY} WHERE t.id = ?`);
  const all = db.prepare(`${SELECT_WITH_CATEGORY} ORDER BY t.date DESC, t.id DESC`);

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
    listAll() {
      return all.all().map(toTransaction);
    },
  };
}
