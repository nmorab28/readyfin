const DEFAULT_CATEGORIES = {
  expense: ['Alimentación', 'Transporte', 'Vivienda', 'Servicios', 'Salud', 'Entretenimiento', 'Otros'],
  income: ['Salario', 'Ventas', 'Regalos', 'Otros'],
};

// Idempotent: safe to run on every start-up, it only inserts the defaults that are missing.
export function seedDefaultCategories(db) {
  const exists = db.prepare(
    'SELECT 1 FROM categories WHERE type = ? AND name = ? AND is_default = 1',
  );
  const insert = db.prepare(
    'INSERT INTO categories (name, type, is_default) VALUES (?, ?, 1)',
  );

  db.transaction(() => {
    for (const [type, names] of Object.entries(DEFAULT_CATEGORIES)) {
      for (const name of names) {
        if (!exists.get(type, name)) insert.run(name, type);
      }
    }
  })();
}
