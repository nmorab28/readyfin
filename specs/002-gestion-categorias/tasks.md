# Tasks: Gestión de categorías

**Input**: `specs/002-gestion-categorias/spec.md`

**Tests**: obligatorios (constitución, principio III): primero las pruebas, luego la implementación.

## User Story 1 — Ver las categorías disponibles (P1) — RDF-8 (rama `feat/RDF-8-view-categories`)

**Goal**: el usuario abre "Categorías" y ve las categorías agrupadas en Gastos e Ingresos, con las
predefinidas distinguidas de las personalizadas.

**Independent Test**: instalación nueva → abrir "Categorías" → 7 gastos y 4 ingresos, todas
"Predefinida".

### Tests (escribir primero)

- [X] T101 [P] [US1] Integración: `GET /api/categories` lista las 11 predefinidas con `isDefault: true`; una categoría con `is_default = 0` sale con `isDefault: false`, en `backend/tests/integration/categories.list.test.js`
- [X] T102 [P] [US1] Componente: `CategoriesPage` agrupa en "Gastos" e "Ingresos", marca "Predefinida"/"Personalizada" y ofrece "Reintentar" si falla la carga, en `frontend/tests/categories/CategoriesPage.test.jsx`
- [X] T103 [P] [US1] `App` permite cambiar entre "Movimientos" y "Categorías", en `frontend/tests/App.test.jsx`

### Implementation

- [X] T104 [US1] `CategoriesPage` con dos grupos por tipo y etiqueta por origen, en `frontend/src/categories/CategoriesPage.jsx` y `categories.css`
- [X] T105 [US1] Navegación entre secciones en `frontend/src/App.jsx` y `frontend/src/styles.css`

**Checkpoint**: RDF-8 cumple la DoD y se demuestra sola. El backend no necesitó cambios: `GET /api/categories` ya existía desde RDF-6.
