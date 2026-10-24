# Product Backlog — ReadyFin

Fuente de verdad del orden: tablero Jira **RDF board** (https://nmorab28.atlassian.net/jira/software/projects/RDF/boards/2).
Este archivo enlaza cada issue de Jira con su especificación de Spec Kit.

**Product Goal**: una persona puede controlar sus finanzas del mes —qué entra, qué sale, cuánto le
queda y cuánto ahorra— en una sola aplicación web.

## Épicas

| Jira | Épica | Spec |
|------|-------|------|
| RDF-1 | Registro de ingresos y gastos | [001](../specs/001-registro-movimientos/spec.md) |
| RDF-2 | Gestión de categorías | [002](../specs/002-gestion-categorias/spec.md) |
| RDF-3 | Presupuesto mensual por categoría | [003](../specs/003-presupuesto-mensual/spec.md) |
| RDF-4 | Dashboard y metas de ahorro | [004](../specs/004-dashboard-metas/spec.md) |

## Backlog ordenado

| # | Jira | Tipo | Historia | Spec / US | Prioridad | Sprint |
|---|------|------|----------|-----------|-----------|--------|
| 1 | RDF-5 | Tarea | Configurar monorepo React + Express + SQLite con pruebas | 001 (habilitador) | Alta | 1 |
| 2 | RDF-6 | Historia | Registrar un gasto | 001 / US1 | P1 | 1 |
| 3 | RDF-7 | Historia | Registrar un ingreso | 001 / US2 | P1 | 1 |
| 4 | RDF-8 | Historia | Ver categorías predefinidas | 002 / US1 | P1 | 1 |
| 5 | RDF-9 | Historia | Filtrar historial por mes y tipo | 001 / US3 | P2 | 1 |
| 6 | RDF-10 | Historia | Crear categoría personalizada | 002 / US2 | P1 | — |
| 7 | RDF-11 | Historia | Resumen del mes en el dashboard | 004 / US1 | P1 | — |
| 8 | RDF-12 | Historia | Definir límite mensual por categoría | 003 / US1 | P1 | — |
| 9 | RDF-13 | Historia | Ver avance del presupuesto | 003 / US2 | P1 | — |
| 10 | RDF-14 | Historia | Editar un movimiento | 001 / US4 | P2 | — |
| 11 | RDF-15 | Historia | Alertas de presupuesto 80 % / 100 % | 003 / US3 | P2 | — |
| 12 | RDF-16 | Historia | Crear meta de ahorro | 004 / US3 | P2 | — |
| 13 | RDF-17 | Historia | Abonar a una meta | 004 / US4 | P2 | — |
| 14 | RDF-18 | Historia | Gráfico de gastos por categoría | 004 / US2 | P2 | — |
| 15 | RDF-19 | Historia | Renombrar categoría personalizada | 002 / US3 | P2 | — |
| 16 | RDF-20 | Historia | Eliminar un movimiento | 001 / US5 | P3 | — |
| 17 | RDF-21 | Historia | Eliminar categoría reasignando movimientos | 002 / US4 | P3 | — |
| 18 | RDF-22 | Historia | Copiar presupuesto del mes anterior | 003 / US4 | P3 | — |
| 19 | RDF-23 | Historia | Metas activas en el dashboard | 004 / US5 | P3 | — |

Estimación: no se usan story points. Cada historia se dividió para terminarse en ≤ 2 días y el
pronóstico se hace contando historias terminadas por sprint (ver constitución).

## Sprint 1 — 2026-10-26 a 2026-10-30

**Sprint Goal**: Un usuario puede registrar sus ingresos y gastos y consultarlos por mes, y los
datos se conservan al volver a abrir la app.

**Pronóstico**: RDF-5, RDF-6, RDF-7, RDF-8, RDF-9 (5 elementos; sin historial previo, se revisa en
la retrospectiva para calibrar el Sprint 2).

**Plan SDD del sprint** (spec `specs/001-registro-movimientos`; ramas cortas desde `main`, un PR
por paso — ver [plan.md](../specs/001-registro-movimientos/plan.md#flujo-de-ramas-y-revisión)):

1. `/speckit-plan` → rama `docs/RDF-1-plan-registro-movimientos`
2. `/speckit-tasks` → `tasks.md` con las tareas de RDF-5, RDF-6, RDF-7, RDF-9
3. `/speckit-analyze` para verificar consistencia spec ↔ plan ↔ tareas
4. `/speckit-implement` historia por historia: `chore/RDF-5-…`, luego `feat/RDF-6-…`, etc.

Formato de commit y título de PR: `type(RDF-n): descripción en imperativo`.

RDF-8 (ver categorías) se planifica sobre `specs/002-gestion-categorias` con el mismo flujo.

## Eventos (sprint de 1 semana)

| Evento | Cuándo | Duración máx. |
|--------|--------|---------------|
| Sprint Planning | Lunes, inicio | 1 h |
| Daily Scrum | Cada día | 15 min |
| Refinamiento | Miércoles | 30 min |
| Sprint Review | Viernes | 30 min |
| Retrospectiva | Viernes, tras la Review | 30 min, máx. 2 acciones |
