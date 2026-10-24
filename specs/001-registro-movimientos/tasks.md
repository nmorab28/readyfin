# Tasks: Registro de ingresos y gastos

**Input**: Design documents from `/specs/001-registro-movimientos/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/openapi.yaml](contracts/openapi.yaml)

**Tests**: obligatorios. La constitución (principio III) exige que cada escenario Given/When/Then
tenga una prueba que falle antes de implementarlo. En cada historia las pruebas van primero.

**Organization**: una fase por historia; cada fase es un PR con su clave de Jira.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1…US5 de `spec.md`; entre paréntesis la clave de Jira

## Path Conventions

Aplicación web: `backend/src/`, `backend/tests/`, `frontend/src/`, `frontend/tests/`.

---

## Phase 1: Setup — RDF-5 (rama `chore/RDF-5-monorepo-setup`)

**Purpose**: monorepo con npm workspaces, dependencias de todo el sprint y CI.

- [X] T001 Crear `package.json` raíz con `"workspaces": ["backend", "frontend"]` y scripts `dev` (concurrently), `test` (ambos workspaces) en `package.json`
- [X] T002 [P] Crear `backend/package.json` (ESM, Express 4, better-sqlite3, zod; dev: vitest, supertest) y `backend/vitest.config.js`
- [X] T003 [P] Crear `frontend/package.json` (React 18, Vite; dev: vitest, jsdom, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom), `frontend/vite.config.js` con proxy `/api` → `http://localhost:3001` y config de pruebas
- [X] T004 Instalar dependencias y generar `package-lock.json` (único PR que lo modifica)
- [X] T005 [P] Crear `.github/workflows/ci.yml`: Node 22, `npm ci`, `npm test` en cada PR a `main`

---

## Phase 2: Foundational — RDF-5 (misma rama)

**Purpose**: base que bloquea todas las historias.

### Tests (escribir primero)

- [X] T006 [P] Prueba de integración `GET /api/health` → 200 `{"status":"ok"}` en `backend/tests/integration/health.test.js`
- [X] T007 [P] Prueba de semilla: base nueva tiene 7 categorías `expense` y 4 `income` con `isDefault: true`; ejecutar la semilla dos veces no duplica filas, en `backend/tests/integration/seed.test.js`
- [X] T008 [P] Prueba de errores: una ruta desconocida bajo `/api` → 404 `{"error":{"code":"NOT_FOUND",…}}`; una excepción inesperada → 500 `INTERNAL_ERROR` sin detalles internos, en `backend/tests/integration/errors.test.js`

### Implementation

- [X] T009 Esquema SQLite con las restricciones de data-model.md: `amount_cents INTEGER NOT NULL CHECK (amount_cents BETWEEN 1 AND 99999999999999)`, `note TEXT CHECK (note IS NULL OR length(note) <= 200)`, `type IN ('income','expense')`, FK `ON DELETE RESTRICT`, índice `idx_transactions_date`, en `backend/src/db/schema.sql`
- [X] T010 `openDb(path)`: abre la conexión, `PRAGMA foreign_keys = ON`, aplica el esquema y la semilla, en `backend/src/db/connection.js`
- [X] T011 Semilla idempotente: `expense` = Alimentación, Transporte, Vivienda, Servicios, Salud, Entretenimiento, Otros; `income` = Salario, Ventas, Regalos, Otros, en `backend/src/db/seed.js`
- [X] T012 `ValidationError`, `NotFoundError` y middleware que los traduce al formato `Error` del contrato, en `backend/src/http/errors.js`
- [X] T013 `createApp(db)` con JSON, `GET /api/health`, 404 de `/api` y manejador de errores, en `backend/src/app.js`
- [X] T014 Arranque en `:3001` con base en `backend/data/readyfin.sqlite`, en `backend/src/server.js`
- [X] T015 [P] Esqueleto del frontend: `frontend/index.html`, `frontend/src/main.jsx`, `frontend/src/App.jsx` que muestra el estado de `/api/health`
- [X] T016 [P] Prueba del esqueleto: `App` muestra "API conectada" cuando health responde, en `frontend/tests/App.test.jsx`

**Checkpoint**: `npm test` en verde, `npm run dev` levanta ambos lados, CI corre en el PR.

---

## Phase 3: User Story 1 — Registrar un gasto (P1) 🎯 MVP — RDF-6 (rama `feat/RDF-6-register-expense`)

**Goal**: el usuario registra un gasto y lo ve en la lista.

**Independent Test**: app vacía → registrar gasto de 25.000 en Alimentación → aparece en la lista (quickstart V2–V4, V11, V12).

### Tests (escribir primero)

- [X] T017 [P] [US1] Pruebas unitarias del esquema zod: `amountCents` entero 1…99999999999999, `date` `YYYY-MM-DD` válida, `note` ≤ 200 recortada y vacía → null, campos extra rechazados, en `backend/tests/unit/transactions.schema.test.js`
- [X] T018 [P] [US1] Pruebas de integración: `GET /api/categories?type=expense` devuelve solo gastos; `POST /api/transactions` válido → 201 con `category`; monto 0, negativo o ausente → 400 "El monto debe ser mayor que cero" con `field: "amountCents"`; sin categoría o inexistente → 400 `field: "categoryId"`, en `backend/tests/integration/transactions.create.test.js`
- [X] T019 [P] [US1] Pruebas unitarias de `parseCopToCents` ("25.000" → 2500000, "1.234,5" → 123450, "0", "-5", "abc", "1,234" → error) y `formatCents`, en `frontend/tests/lib/money.test.js`
- [X] T020 [P] [US1] Prueba de `todayLocal()` con reloj inyectado a las 20:00 del 2026-10-23 en UTC-5 → "2026-10-23", en `frontend/tests/lib/dates.test.js`
- [X] T021 [P] [US1] Pruebas de `TransactionForm`: fecha por defecto hoy, mensajes de monto y categoría, botón deshabilitado mientras guarda, datos conservados si la API falla, en `frontend/tests/transactions/TransactionForm.test.jsx`

### Implementation

- [X] T022 [P] [US1] Repositorio de categorías (`listCategories({ type })`), en `backend/src/categories/categories.repository.js`
- [X] T023 [US1] Ruta `GET /api/categories` con validación de `type`, en `backend/src/categories/categories.routes.js`
- [X] T024 [P] [US1] Esquema zod `TransactionInput` con mensajes en español, en `backend/src/transactions/transactions.schema.js`
- [X] T025 [P] [US1] Repositorio de movimientos (`insert`, `findById` con categoría), en `backend/src/transactions/transactions.repository.js`
- [X] T026 [US1] Servicio `createTransaction(input)`: valida, comprueba que la categoría exista y sea del tipo del movimiento, inserta, en `backend/src/transactions/transactions.service.js`
- [X] T027 [US1] Rutas `POST /api/transactions` y `GET /api/transactions` (lista simple ordenada por `date DESC, id DESC`), en `backend/src/transactions/transactions.routes.js`
- [X] T028 [P] [US1] Cliente HTTP que traduce el formato `Error` del contrato, en `frontend/src/api/client.js`
- [X] T029 [P] [US1] `parseCopToCents` y `formatCents` (`Intl.NumberFormat('es-CO', {style:'currency', currency:'COP'})`), en `frontend/src/lib/money.js`
- [X] T030 [P] [US1] `todayLocal(now)` y `isFuture(date, now)`, en `frontend/src/lib/dates.js`
- [X] T031 [US1] `TransactionForm` (tipo fijo Gasto en esta historia), en `frontend/src/transactions/TransactionForm.jsx`
- [X] T032 [US1] `TransactionList` con fecha, categoría, monto y etiqueta "Futuro", en `frontend/src/transactions/TransactionList.jsx`
- [X] T033 [US1] `TransactionsPage` que une formulario y lista; montarla en `frontend/src/App.jsx`

**Checkpoint**: RDF-6 cumple la DoD y se demuestra solo.

---

## Phase 4: User Story 2 — Registrar un ingreso (P1) — RDF-7 (rama `feat/RDF-7-register-income`)

**Goal**: el usuario registra ingresos y los distingue de los gastos.

**Independent Test**: registrar ingreso de 2.000.000 en Salario → aparece con `+` y color de ingreso (quickstart V5, V6).

### Tests (escribir primero)

- [ ] T034 [P] [US2] Integración: ingreso válido → 201; ingreso con categoría de gasto → 400 `field: "categoryId"`, en `backend/tests/integration/transactions.income.test.js`
- [ ] T035 [P] [US2] Componente: cambiar a Ingreso muestra solo Salario, Ventas, Regalos, Otros y limpia la categoría elegida; la lista muestra `+` en ingresos y `−` en gastos, en `frontend/tests/transactions/income.test.jsx`

### Implementation

- [ ] T036 [US2] Selector de tipo en `TransactionForm` que recarga categorías por tipo, en `frontend/src/transactions/TransactionForm.jsx`
- [ ] T037 [US2] Signo y estilo por tipo en `TransactionList`, en `frontend/src/transactions/TransactionList.jsx` y `frontend/src/transactions/transactions.css`

**Checkpoint**: RDF-6 y RDF-7 funcionan juntas y por separado.

---

## Phase 5: User Story 3 — Historial filtrado por mes y tipo (P2) — RDF-9 (rama `feat/RDF-9-filter-history`)

**Goal**: el usuario ve los movimientos de un mes, filtra por tipo y ve el total.

**Independent Test**: movimientos en septiembre y octubre → filtrar octubre y luego Gasto → solo esos y total correcto (quickstart V7–V9).

### Tests (escribir primero)

- [ ] T038 [P] [US3] Integración: `GET /api/transactions?month=2026-10` devuelve solo octubre en orden `date DESC, id DESC` con `totals.incomeCents`, `expenseCents`, `balanceCents`; `type=expense` filtra; `month` ausente o `2026-13` → 400, en `backend/tests/integration/transactions.list.test.js`
- [ ] T039 [P] [US3] Rendimiento: 5.000 movimientos, la consulta de un mes responde en < 1000 ms, en `backend/tests/integration/transactions.perf.test.js`
- [ ] T040 [P] [US3] Componente: `PeriodFilter` cambia mes y tipo; mes vacío muestra "No hay movimientos en este periodo"; se muestra el total, en `frontend/tests/transactions/PeriodFilter.test.jsx`

### Implementation

- [ ] T041 [US3] `listByPeriod({ month, type })` con rango `date >= 'YYYY-MM-01' AND date < 'YYYY-(MM+1)-01'` y totales con `SUM`, en `backend/src/transactions/transactions.repository.js`
- [ ] T042 [US3] Validar `month` y `type` y devolver `{ items, totals }`, en `backend/src/transactions/transactions.service.js` y `transactions.routes.js`
- [ ] T043 [US3] `PeriodFilter` (mes actual por defecto) y totales en `TransactionsPage`, en `frontend/src/transactions/PeriodFilter.jsx` y `TransactionsPage.jsx`

**Checkpoint**: Sprint Goal del Sprint 1 cumplido (RDF-5, 6, 7, 9).

---

## Phase 6: User Story 4 — Editar un movimiento (P2) — RDF-14 (sprint siguiente)

- [ ] T044 [P] [US4] Integración: `PUT /api/transactions/:id` aplica las mismas validaciones, 404 si no existe, en `backend/tests/integration/transactions.update.test.js`
- [ ] T045 [P] [US4] Componente: editar conserva el valor original si la validación falla, en `frontend/tests/transactions/edit.test.jsx`
- [ ] T046 [US4] `updateTransaction(id, input)` y ruta `PUT`, en `backend/src/transactions/`
- [ ] T047 [US4] Modo edición en `TransactionForm` y acción "Editar" en `TransactionList`, en `frontend/src/transactions/`

## Phase 7: User Story 5 — Eliminar un movimiento (P3) — RDF-20 (sprint siguiente)

- [ ] T048 [P] [US5] Integración: `DELETE /api/transactions/:id` → 204; 404 si no existe, en `backend/tests/integration/transactions.delete.test.js`
- [ ] T049 [P] [US5] Componente: confirmar elimina y actualiza totales; cancelar conserva, en `frontend/tests/transactions/delete.test.jsx`
- [ ] T050 [US5] `deleteTransaction(id)` y ruta `DELETE`, en `backend/src/transactions/`
- [ ] T051 [US5] Diálogo de confirmación en `TransactionList`, en `frontend/src/transactions/TransactionList.jsx`

---

## Phase 8: Polish

- [ ] T052 Ejecutar los escenarios de [quickstart.md](quickstart.md) de punta a punta y registrar el resultado en el PR de cierre del sprint
- [ ] T053 [P] `README.md` con requisitos, `npm install`, `npm run dev`, `npm test`

---

## Dependencies & Execution Order

- **Phase 1–2 (RDF-5)** bloquea todo lo demás.
- **US1 (RDF-6)** depende solo de la base. **US2 (RDF-7)** reutiliza formulario y lista de US1:
  se hace después de US1 para no editar los mismos archivos en paralelo.
- **US3 (RDF-9)** depende de la base; toca la consulta de lista y `TransactionsPage`, así que se
  integra después de US1.
- **US4 y US5** quedan para el Sprint 2.

Orden de PR: RDF-5 → RDF-6 → RDF-7 → RDF-9. Cada PR sale de `main` actualizado tras fusionar el
anterior.

## Parallel Example: User Story 1

```text
T017 schema test  ·  T018 API test  ·  T019 money test  ·  T020 dates test  ·  T021 form test
T022 categories repo  ·  T024 zod schema  ·  T025 transactions repo  ·  T028 client  ·  T029 money  ·  T030 dates
```

## Implementation Strategy

1. RDF-5 → validar checkpoint → PR.
2. RDF-6 (MVP) → demostrable solo → PR.
3. RDF-7 → PR. 4. RDF-9 → PR → Sprint Review.

Cada historia: pruebas en rojo → implementación → verde → revisión del diff → PR con la clave.
