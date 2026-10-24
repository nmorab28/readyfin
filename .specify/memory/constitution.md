# ReadyFin Constitution

ReadyFin es una aplicación web de finanzas personales construida como **demostración académica**
de Spec-Driven Development (SDD) con Spec Kit y Scrum sobre Jira (proyecto `RDF`).

## Core Principles

### I. Especificación antes que código (SDD)

- Ninguna línea de código de producto se escribe sin `spec.md` aprobado para esa funcionalidad.
- El flujo por funcionalidad es obligatorio: `/speckit-specify` → (`/speckit-clarify`) →
  `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
- La especificación describe el QUÉ y el POR QUÉ; el plan describe el CÓMO. Ninguno mezcla al otro.
- Cuando la implementación descubre que la especificación estaba mal, se corrige primero la
  especificación y luego el código.

Racional: la especificación es el artefacto fuente; el código es su consecuencia verificable.

### II. Incrementos verticales e independientes

- Cada historia de usuario es un corte vertical (UI + API + datos) que se puede demostrar sola.
- Ninguna historia se divide por capa técnica ("backend de X", "frontend de X").
- Toda historia que entra a un sprint debe poder terminarse en 2 días o menos; si no, se divide.

Racional: solo un incremento usable produce retroalimentación real en la Sprint Review.

### III. Pruebas primero para reglas de negocio (NO NEGOCIABLE)

- Cada escenario de aceptación (Given/When/Then) tiene al menos una prueba automatizada que falla
  antes de implementarlo y pasa después.
- Reglas de dinero (saldos, totales, presupuestos, progreso de metas) se prueban con pruebas
  unitarias; los endpoints de la API con pruebas de integración contra una base SQLite temporal.
- La suite completa debe estar en verde antes de integrar a `main`.

Racional: en finanzas un cálculo incorrecto es peor que una función ausente.

### IV. Exactitud monetaria y de datos

- Los montos se almacenan como enteros en la unidad mínima (centavos) y nunca como punto flotante.
- Una sola moneda por instalación (COP por defecto); el formato se aplica solo en la presentación.
- Las fechas se guardan en ISO-8601 (`YYYY-MM-DD`); los periodos mensuales se calculan por mes
  calendario.
- Toda entrada del usuario se valida en el servidor; la validación del cliente es solo ayuda.

Racional: los errores de redondeo y de fechas son los defectos más comunes en apps financieras.

### V. Simplicidad (YAGNI)

- Usuario único, sin autenticación, ejecución local: es una demostración.
- Sin microservicios, colas, cachés ni ORMs pesados mientras no exista un requisito que lo exija.
- Cualquier complejidad adicional se justifica en la sección "Complexity Tracking" del plan.

Racional: el objetivo es demostrar el proceso de ingeniería, no construir un producto completo.

## Restricciones técnicas y atributos de calidad

- **Stack**: frontend React (Vite) + backend Node.js/Express + base de datos SQLite.
  Monorepo con `frontend/` y `backend/`; API REST JSON bajo `/api`.
- **Atributos priorizados** (ISO 25010):
  1. Adecuación funcional: los cálculos financieros son correctos en el 100 % de las pruebas.
  2. Usabilidad: registrar un movimiento toma menos de 30 segundos a un usuario nuevo.
  3. Mantenibilidad: cada funcionalidad vive en su propio módulo y tiene pruebas.
  4. Eficiencia: las vistas cargan en menos de 1 s con 5.000 movimientos.
- **Atributos deliberadamente despriorizados**: escalabilidad, alta disponibilidad, multiusuario
  y seguridad avanzada. Motivo: demo local de un solo usuario; se revisan si el producto deja de
  ser una demostración.
- **Idioma**: interfaz y documentación en español.

## Flujo de trabajo y calidad

- **Scrum** con sprints de **1 semana**, un único Sprint Goal por sprint escrito como resultado.
- **Trazabilidad**: cada historia vive en Jira (`RDF-n`). Ramas, commits y PR llevan la clave:
  `RDF-12-registrar-gasto`, `RDF-12 valida monto positivo`.
- **Tablero**: Por hacer → En curso → En revisión → Hecho. WIP en curso ≤ 2.
- **Definition of Ready**: historia con criterios Given/When/Then, dependencias identificadas,
  tamaño ≤ 2 días y spec de la funcionalidad aprobada.
- **Definition of Done**:
  - Criterios de aceptación cubiertos por pruebas automatizadas en verde.
  - Código revisado mediante Pull Request en GitHub.
  - `tasks.md` de la funcionalidad actualizado.
  - Demostrable en el entorno local con datos de ejemplo.
  - Issue de Jira movido a Hecho solo cuando se cumple todo lo anterior (no por smart commit).

## Governance

- Esta constitución prevalece sobre cualquier otra práctica del repositorio; `/speckit-plan`
  debe verificar su cumplimiento en la sección "Constitution Check".
- Enmiendas: se proponen por PR modificando este archivo, con justificación y versión nueva.
- Versionado semántico: MAJOR = se elimina o redefine un principio; MINOR = se agrega un principio
  o sección; PATCH = aclaraciones de redacción.
- Revisión de cumplimiento en cada Sprint Retrospective.

**Version**: 1.0.0 | **Ratified**: 2026-10-23 | **Last Amended**: 2026-10-23
