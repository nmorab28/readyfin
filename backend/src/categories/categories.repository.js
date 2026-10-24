export function toCategory(row) {
  return { id: row.id, name: row.name, type: row.type, isDefault: row.is_default === 1 };
}

export function createCategoryRepository(db) {
  const all = db.prepare('SELECT id, name, type, is_default FROM categories ORDER BY type, name');
  const ofType = db.prepare('SELECT id, name, type, is_default FROM categories WHERE type = ? ORDER BY name');
  const byId = db.prepare('SELECT id, name, type, is_default FROM categories WHERE id = ?');

  return {
    list({ type } = {}) {
      return (type ? ofType.all(type) : all.all()).map(toCategory);
    },
    findById(id) {
      const row = byId.get(id);
      return row ? toCategory(row) : null;
    },
  };
}
