# Data Model: Registro de ingresos y gastos

**Feature**: `001-registro-movimientos` | **Date**: 2026-10-23

## Entidades

### Category

Conjunto predefinido sembrado en el primer arranque. Su gestión (crear, renombrar, eliminar) se
especifica en `002-gestion-categorias`; esta funcionalidad solo la lee.

| Campo | Tipo | Reglas |
|-------|------|--------|
| `id` | entero | PK autoincremental |
| `name` | texto | 1–30 caracteres, obligatorio |
| `type` | texto | `income` \| `expense` |
| `isDefault` | booleano | `true` para las sembradas |

Unicidad: (`type`, nombre normalizado) — se aplica en `002`; en `001` lo garantiza la semilla.

**Semilla** (FR-001 de `002`, supuesto de `001`):

- `expense`: Alimentación, Transporte, Vivienda, Servicios, Salud, Entretenimiento, Otros
- `income`: Salario, Ventas, Regalos, Otros

### Transaction (Movimiento)

| Campo | Tipo | Reglas | Requisito |
|-------|------|--------|-----------|
| `id` | entero | PK autoincremental | — |
| `type` | texto | `income` \| `expense`, obligatorio | FR-001 |
| `amountCents` | entero | 1 ≤ valor ≤ 99.999.999.999.999 | FR-002, principio IV |
| `date` | texto | `YYYY-MM-DD` válido; por defecto hoy (cliente) | FR-004 |
| `categoryId` | entero | FK → Category; `category.type` debe ser igual a `type` | FR-003 |
| `note` | texto \| null | 0–200 caracteres; se recortan espacios; vacío → null | Edge cases |
| `createdAt` | texto | ISO-8601 con hora, lo asigna el servidor | — |

Relación: Category 1 — N Transaction. Una categoría con movimientos no puede borrarse sin
reasignarlos (regla de `002`; la FK usa `ON DELETE RESTRICT`).

## Valores derivados (no se almacenan)

| Valor | Cálculo | Requisito |
|-------|---------|-----------|
| Total del filtro | `SUM(amountCents)` de los movimientos que cumplen `month` y `type` | FR-006, SC-004 |
| Totales del mes sin filtro de tipo | `income`, `expense` y `balance = income − expense` | FR-006 |
| Es futuro | `date > hoy` (calculado en el cliente) | Edge cases |

## Esquema SQLite

```sql
CREATE TABLE categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL CHECK (length(name) BETWEEN 1 AND 30),
  type        TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
  is_default  INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1))
);

CREATE TABLE transactions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  type          TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
  amount_cents  INTEGER NOT NULL CHECK (amount_cents BETWEEN 1 AND 99999999999999),
  date          TEXT    NOT NULL CHECK (date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  category_id   INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  note          TEXT    CHECK (note IS NULL OR length(note) <= 200),
  created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_transactions_date ON transactions(date);
```

Los `CHECK` son una segunda línea de defensa: la validación con mensajes para el usuario ocurre
antes, en la capa de servicio (principio IV). `PRAGMA foreign_keys = ON` se activa al abrir la
conexión.

## Orden y filtrado

- Orden de la lista: `date DESC, id DESC` (FR-005; el `id` desempata movimientos del mismo día).
- Filtro por mes: `date >= 'YYYY-MM-01' AND date < 'YYYY-(MM+1)-01'`, que aprovecha el índice
  `idx_transactions_date` (SC-003).
