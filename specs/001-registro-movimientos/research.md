# Research: Registro de ingresos y gastos

**Feature**: `001-registro-movimientos` | **Date**: 2026-10-23

No quedaron puntos `NEEDS CLARIFICATION` en el Technical Context; cada decisión abajo resuelve una
elección tecnológica o una regla que la spec dejó abierta.

## R1. Runtime y lenguaje

- **Decision**: Node.js 22 LTS (instalado: v22.23.2), JavaScript ESM en backend y frontend.
- **Rationale**: es el runtime ya disponible en la máquina del equipo; JavaScript evita un paso de
  compilación en la API y mantiene la demo pequeña (constitución, principio V).
- **Alternatives considered**: TypeScript — mejor mantenibilidad a largo plazo, pero agrega
  configuración en dos proyectos para una demo de un sprint. Se puede adoptar en un sprint
  posterior sin cambiar la arquitectura.

## R2. Acceso a SQLite

- **Decision**: `better-sqlite3`, consultas SQL escritas a mano, sin ORM.
- **Rationale**: API síncrona y simple, transacciones explícitas, binarios precompilados para
  Node 22 en Windows/Linux, y permite usar `:memory:` en pruebas de integración.
- **Alternatives considered**: `node:sqlite` integrado — sin dependencia nativa, pero aún marcado
  como experimental en Node 22. Prisma/Sequelize — rechazados por el principio V (ORM pesado
  sin requisito que lo justifique).

## R3. Framework HTTP y validación

- **Decision**: Express 4 + `zod` para validar el cuerpo de las peticiones en el servidor.
- **Rationale**: Express es el stack fijado en la constitución. `zod` expresa las reglas FR-002,
  FR-003 y el límite de la nota en un solo esquema que también se prueba de forma unitaria.
- **Alternatives considered**: validación manual con `if` — más código y mensajes inconsistentes;
  `express-validator` — acopla la validación a las rutas y es más difícil de probar sola.

## R4. Representación del dinero

- **Decision**: la API recibe y devuelve `amountCents` (entero). El frontend convierte la entrada
  del usuario con formato es-CO: el punto es separador de miles y la coma es separador decimal
  (máximo 2 decimales). Rango válido: 1 a 99.999.999.999.999 centavos (999.999.999.999,99).
- **Rationale**: principio IV de la constitución (nunca punto flotante para montos). Hacer la
  conversión solo en la presentación deja la regla de negocio en el servidor.
- **Alternatives considered**: enviar decimales como string y convertir en el servidor —
  mueve la regla de formato regional a la API, que no debería conocer el locale.

## R5. Formato de moneda y fechas

- **Decision**: `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' })` para mostrar;
  fechas como `YYYY-MM-DD` en la API; el mes del filtro como `YYYY-MM`. "Hoy" se calcula con la
  fecha local del navegador, no en UTC.
- **Rationale**: FR-004 y FR-010. Calcular "hoy" en UTC haría que un gasto registrado a las 8 p. m.
  en Bogotá (UTC-5) quedara con la fecha del día siguiente.
- **Alternatives considered**: librerías de fechas (date-fns, dayjs) — innecesarias para comparar
  y formatear cadenas ISO.

## R6. Pruebas

- **Decision**: Vitest en ambos proyectos; Supertest para la API contra SQLite `:memory:`;
  React Testing Library + jsdom para componentes.
- **Rationale**: un solo runner y una sola sintaxis para todo el monorepo; cada escenario
  Given/When/Then de la spec se traduce a un `it(...)` (principio III).
- **Alternatives considered**: Jest — requiere configuración extra para ESM; Playwright E2E —
  valioso, pero se pospone: el costo de mantenerlo no se justifica en el primer sprint.

## R7. Organización del repositorio

- **Decision**: npm workspaces con `backend/` y `frontend/`; `npm run dev` en la raíz levanta ambos
  con `concurrently`; Vite redirige `/api` a `http://localhost:3001`.
- **Rationale**: un solo `npm install` y un solo `npm test` para la Definition of Done y para CI.
- **Alternatives considered**: dos repositorios — duplica CI y rompe la trazabilidad spec ↔ código;
  Turborepo/Nx — complejidad sin necesidad (principio V).

## R8. Integración continua

- **Decision**: GitHub Actions con un job `npm ci && npm test` en Node 22 sobre cada PR a `main`.
- **Rationale**: criterio de aceptación de RDF-5 y DoD ("suite en verde en el pipeline").

## R9. Casos límite de la spec

| Caso | Decisión |
|------|----------|
| Doble clic en Guardar | El botón se deshabilita mientras la petición está en curso |
| Servidor no responde | Mensaje de error; el formulario conserva lo digitado |
| Fecha futura | Se acepta; la lista la marca con la etiqueta "Futuro" |
| Nota > 200 caracteres | `maxLength` en el campo y rechazo 400 en la API |
| Tipo y categoría incompatibles | Rechazo 400 con `field: "categoryId"` |

## R10. Versiones y scripts de instalación (añadido en RDF-5)

- **Decision**: versiones vigentes sin avisos de seguridad (vitest 5, vite 8, zod 4,
  better-sqlite3 13, jsdom 30) y `ignore-scripts=true` en `.npmrc`. React 18 y Express 4 se
  mantienen como dice el plan: no tienen avisos.
- **Rationale**: las primeras versiones elegidas (vitest 2, vite 5/6, zod 3) sumaban 7 avisos de
  `npm audit`, 2 críticos. better-sqlite3 13 trae binarios precompilados para Windows, Linux y
  macOS, pero npm intenta compilarlo con node-gyp, que exige Visual Studio en Windows. Ninguna otra
  dependencia necesita scripts de instalación.
- **Alternatives considered**: better-sqlite3 12 con `prebuild-install` — paquete sin
  mantenimiento que descarga binarios en la instalación; `node:sqlite` — sigue experimental en
  Node 22 (ver R2); instalar las herramientas de C++ — carga innecesaria para cada colaborador.
- **Consequence**: si en el futuro una dependencia necesita su script de instalación, hay que
  ejecutarlo de forma explícita (`npm rebuild <paquete>`) o revisar esta decisión.
