# Implementation Plan: Registro de ingresos y gastos

**Branch**: `docs/RDF-1-plan-registro-movimientos` | **Date**: 2026-10-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-registro-movimientos/spec.md`

**Jira**: épica RDF-1 · Sprint 1: RDF-5 (habilitador), RDF-6, RDF-7, RDF-9 · siguientes: RDF-14, RDF-20

## Summary

El usuario registra ingresos y gastos (tipo, monto, fecha, categoría, nota), los consulta
filtrados por mes y tipo con el total del periodo, y puede editarlos y eliminarlos. Los datos
persisten entre sesiones.

Enfoque técnico: monorepo con npm workspaces. Una API REST en Express guarda los datos en SQLite
mediante `better-sqlite3` con SQL escrito a mano, y un frontend en React + Vite la consume. Los
montos viajan y se guardan como centavos enteros; el formato COP solo existe en la presentación.
Cada escenario Given/When/Then de la spec se convierte en una prueba con Vitest antes de
implementarse. Detalle de las decisiones en [research.md](research.md).

## Technical Context

**Language/Version**: JavaScript (ESM) sobre Node.js 22 LTS

**Primary Dependencies**: Express 4, better-sqlite3, zod (backend); React 18, Vite (frontend);
concurrently (raíz)

**Storage**: SQLite en archivo (`backend/data/readyfin.sqlite`); `:memory:` en pruebas

**Testing**: Vitest + Supertest (API), Vitest + React Testing Library + jsdom (UI)

**Target Platform**: navegadores de escritorio actuales; API local en Node 22 (Windows/Linux)

**Project Type**: aplicación web (frontend + backend)

**Performance Goals**: lista filtrada por mes en < 1 s con 5.000 movimientos (SC-003)

**Constraints**: un solo usuario, sin autenticación, ejecución local; sin punto flotante para
montos; mensajes en español

**Scale/Scope**: 1 usuario, hasta ~5.000 movimientos, 1 pantalla de movimientos, 6 endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cómo lo cumple este plan | Estado |
|-----------|--------------------------|--------|
| I. Especificación antes que código | `spec.md` validado (checklist completa); el plan no agrega comportamiento ausente de la spec | ✅ |
| II. Incrementos verticales | Cada historia (RDF-6, 7, 9, 14, 20) toca UI + API + datos y se prueba sola; ninguna tarea se define por capa | ✅ |
| III. Pruebas primero | Escenarios → pruebas Vitest/Supertest antes del código; `npm test` en CI bloquea el merge | ✅ |
| IV. Exactitud monetaria y de datos | `amount_cents INTEGER` con `CHECK`, fechas ISO, validación zod en el servidor | ✅ |
| V. Simplicidad | 2 workspaces, sin ORM, sin auth, sin estado global en el cliente | ✅ |
| Restricciones técnicas | React (Vite) + Express + SQLite, API bajo `/api`, monorepo `frontend/` + `backend/` | ✅ |

**Re-check post-diseño (Phase 1)**: sin violaciones. El modelo de datos y el contrato no
introducen entidades ni servicios fuera de la spec; `Complexity Tracking` queda vacío.

## Project Structure

### Documentation (this feature)

```text
specs/001-registro-movimientos/
├── plan.md              # Este archivo
├── research.md          # Phase 0: decisiones técnicas
├── data-model.md        # Phase 1: entidades, reglas y esquema SQLite
├── quickstart.md        # Phase 1: guía de validación de punta a punta
├── contracts/
│   └── openapi.yaml     # Phase 1: contrato REST
└── tasks.md             # Phase 2 (/speckit-tasks; no lo crea este comando)
```

### Source Code (repository root)

```text
package.json                     # workspaces + scripts dev / test
.github/workflows/ci.yml         # npm ci && npm test en cada PR

backend/
├── package.json
├── src/
│   ├── server.js                # arranque: abre la BD y escucha en :3001
│   ├── app.js                   # createApp(db): Express, rutas, manejo de errores
│   ├── db/
│   │   ├── connection.js        # openDb(path) + PRAGMA foreign_keys
│   │   ├── schema.sql
│   │   └── seed.js              # categorías predefinidas, idempotente
│   ├── categories/
│   │   ├── categories.routes.js
│   │   └── categories.repository.js
│   ├── transactions/
│   │   ├── transactions.routes.js
│   │   ├── transactions.service.js     # reglas: tipo ↔ categoría, totales
│   │   ├── transactions.repository.js  # SQL
│   │   └── transactions.schema.js      # zod
│   └── http/
│       └── errors.js            # ValidationError, NotFoundError → JSON del contrato
└── tests/
    ├── unit/                    # schema y service
    └── integration/             # Supertest contra :memory:

frontend/
├── package.json
├── vite.config.js               # proxy /api → :3001
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── api/client.js            # fetch + errores del contrato
│   ├── lib/
│   │   ├── money.js             # parseCopToCents / formatCents
│   │   └── dates.js             # todayLocal, monthOf
│   └── transactions/
│       ├── TransactionsPage.jsx
│       ├── TransactionForm.jsx
│       ├── TransactionList.jsx
│       └── PeriodFilter.jsx
└── tests/
```

**Structure Decision**: aplicación web con `backend/` y `frontend/` como workspaces de npm, tal
como exige la constitución. El código se organiza por funcionalidad (`transactions/`,
`categories/`) y no por capa técnica global, para que `002`–`004` agreguen carpetas hermanas
sin tocar las existentes. `createApp(db)` recibe la conexión para que las pruebas usen
`:memory:`.

## Mapa historia → artefactos

| Jira | Historia | Endpoints | Componentes | Pruebas clave |
|------|----------|-----------|-------------|---------------|
| RDF-5 | Monorepo y CI | `GET /health` | `App` | health 200, semilla idempotente, CI verde |
| RDF-6 | Registrar gasto | `GET /categories`, `POST /transactions` | `TransactionForm`, `TransactionList` | monto 0/negativo/vacío → 400; sin categoría → 400; fecha por defecto hoy |
| RDF-7 | Registrar ingreso | mismos | `TransactionForm` (tipo), `TransactionList` (signo/color) | categoría de otro tipo → 400; selector filtra por tipo |
| RDF-9 | Historial filtrado | `GET /transactions?month&type` | `PeriodFilter`, `TransactionList` | solo el mes pedido, orden desc, totales, mensaje vacío, 5.000 filas < 1 s |
| RDF-14 | Editar | `PUT /transactions/:id` | `TransactionForm` en modo edición | mismas validaciones; 404 si no existe |
| RDF-20 | Eliminar | `DELETE /transactions/:id` | confirmación en `TransactionList` | 204; cancelar conserva; 404 si no existe |

## Flujo de ramas y revisión

Se sigue la guía de git del equipo: ramas cortas desde `main`, una rama y un PR por historia,
commit con la clave del ticket como scope, y nada se integra sin revisión y CI en verde.

| Paso | Rama | Commit / título del PR |
|------|------|------------------------|
| Este plan | `docs/RDF-1-plan-registro-movimientos` | `docs(RDF-1): add implementation plan for transaction tracking` |
| Tareas | `docs/RDF-1-tasks-registro-movimientos` | `docs(RDF-1): add task breakdown for transaction tracking` |
| Habilitador | `chore/RDF-5-monorepo-setup` | `chore(RDF-5): scaffold monorepo with express, sqlite and vite` |
| Historias | `feat/RDF-6-register-expense`, `feat/RDF-7-register-income`, `feat/RDF-9-filter-history` | `feat(RDF-n): …` |

Las dependencias nuevas (`package-lock.json`) entran solo en el PR de RDF-5, para que ningún
PR de historia arrastre cambios en el lockfile.

## Complexity Tracking

Sin violaciones de la constitución; no aplica.
