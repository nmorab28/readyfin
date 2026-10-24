# Feature Specification: Gestión de categorías

**Feature Branch**: `002-gestion-categorias`

**Created**: 2026-10-23

**Status**: Draft

**Input**: User description: "Categorías predefinidas y personalizadas para clasificar ingresos y gastos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver las categorías disponibles (Priority: P1)

Como usuario, quiero ver la lista de categorías de ingreso y de gasto, para saber cómo clasificar
mis movimientos.

**Why this priority**: Es la base de las demás historias de categorías y del presupuesto.

**Independent Test**: Abrir la pantalla de categorías en una instalación nueva y ver las
categorías predefinidas agrupadas por tipo.

**Acceptance Scenarios**:

1. **Given** una instalación nueva, **When** abro "Categorías", **Then** veo las categorías
   predefinidas separadas en "Gastos" e "Ingresos".
2. **Given** la lista, **When** la miro, **Then** las categorías predefinidas se distinguen de las
   personalizadas.

---

### User Story 2 - Crear una categoría personalizada (Priority: P1)

Como usuario, quiero crear mis propias categorías (por ejemplo "Mascotas"), para clasificar mis
gastos según mi realidad.

**Why this priority**: Las categorías predefinidas nunca cubren a todos los usuarios.

**Independent Test**: Crear la categoría "Mascotas" de tipo gasto y usarla al registrar un gasto.

**Acceptance Scenarios**:

1. **Given** la pantalla de categorías, **When** creo "Mascotas" de tipo gasto, **Then** aparece en
   la lista y en el selector del formulario de gastos.
2. **Given** que existe "Mascotas" de tipo gasto, **When** intento crear "mascotas" de tipo gasto,
   **Then** se rechaza con "Ya existe una categoría con ese nombre".
3. **Given** el formulario, **When** dejo el nombre vacío o con más de 30 caracteres, **Then** se
   rechaza indicando la regla.

---

### User Story 3 - Renombrar una categoría personalizada (Priority: P2)

Como usuario, quiero renombrar una categoría que creé, para corregir errores o reorganizarme.

**Why this priority**: Útil pero no bloquea el uso diario.

**Independent Test**: Renombrar "Mascota" a "Mascotas" y ver el nuevo nombre en los movimientos
que la usan.

**Acceptance Scenarios**:

1. **Given** una categoría personalizada con movimientos, **When** la renombro, **Then** los
   movimientos muestran el nuevo nombre.
2. **Given** una categoría predefinida, **When** intento renombrarla, **Then** la opción no está
   disponible.

---

### User Story 4 - Eliminar una categoría personalizada (Priority: P3)

Como usuario, quiero eliminar categorías que ya no uso, para mantener la lista limpia.

**Why this priority**: Es mantenimiento; la app funciona sin ello.

**Independent Test**: Eliminar una categoría sin movimientos y comprobar que desaparece.

**Acceptance Scenarios**:

1. **Given** una categoría personalizada sin movimientos, **When** la elimino y confirmo, **Then**
   desaparece de la lista y de los selectores.
2. **Given** una categoría personalizada con movimientos, **When** intento eliminarla, **Then** se
   me pide elegir otra categoría del mismo tipo a la que reasignar esos movimientos antes de
   eliminarla.
3. **Given** una categoría predefinida, **When** intento eliminarla, **Then** la opción no está
   disponible.

---

### Edge Cases

- Nombre con espacios al inicio o final: se recortan antes de validar duplicados.
- Comparación de duplicados sin distinguir mayúsculas ni tildes ("Salud" = "salud").
- Mismo nombre en tipos distintos ("Otros" ingreso y "Otros" gasto): permitido.
- Eliminar una categoría con presupuesto asignado: el presupuesto se elimina junto con ella,
  previa advertencia.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE crear las categorías predefinidas en la primera ejecución.
- **FR-002**: El sistema DEBE listar las categorías agrupadas por tipo, indicando cuáles son
  predefinidas.
- **FR-003**: Los usuarios DEBEN poder crear categorías con nombre (1–30 caracteres) y tipo.
- **FR-004**: El sistema DEBE impedir nombres duplicados dentro del mismo tipo, sin distinguir
  mayúsculas ni tildes.
- **FR-005**: Los usuarios DEBEN poder renombrar solo categorías personalizadas.
- **FR-006**: Los usuarios DEBEN poder eliminar solo categorías personalizadas; si tienen
  movimientos, deben reasignarlos a otra categoría del mismo tipo.
- **FR-007**: Las categorías predefinidas NO DEBEN poder renombrarse ni eliminarse.

### Key Entities

- **Categoría**: nombre, tipo (ingreso/gasto), indicador de predefinida.
  Se relaciona con Movimiento (1 a muchos) y con Presupuesto (1 a muchos, por mes).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario crea una categoría y la usa en un movimiento en menos de 20 segundos.
- **SC-002**: Nunca existen dos categorías del mismo tipo con nombre equivalente.
- **SC-003**: Eliminar una categoría nunca deja movimientos sin categoría.

## Assumptions

- Las categorías predefinidas son las listadas en `001-registro-movimientos`.
- No hay subcategorías ni íconos personalizados en esta versión.
- Depende de `001-registro-movimientos` para mostrar el uso de categorías en movimientos.
