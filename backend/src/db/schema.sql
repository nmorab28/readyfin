-- Schema for specs/001-registro-movimientos/data-model.md.
-- The CHECK constraints are a second line of defence; user-facing validation lives in the services.

CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL CHECK (length(name) BETWEEN 1 AND 30),
  type        TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
  is_default  INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1))
);

CREATE TABLE IF NOT EXISTS transactions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  type          TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
  amount_cents  INTEGER NOT NULL CHECK (amount_cents BETWEEN 1 AND 99999999999999),
  date          TEXT    NOT NULL CHECK (date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  category_id   INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  note          TEXT    CHECK (note IS NULL OR length(note) <= 200),
  created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
