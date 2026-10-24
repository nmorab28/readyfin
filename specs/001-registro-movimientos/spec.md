# Feature Specification: Registro de ingresos y gastos

**Feature Branch**: `001-registro-movimientos`

**Created**: 2026-10-23

**Status**: Draft

**Input**: User description: "Registrar ingresos y gastos con monto, fecha, categoría y nota; ver, editar y eliminar movimientos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar un gasto (Priority: P1)

Como persona que quiere controlar su dinero, quiero registrar un gasto con monto, fecha, categoría
y una nota opcional, para saber en qué se me va el dinero.

**Why this priority**: Sin registrar gastos no existe ninguna otra funcionalidad de la app. Es el
núcleo del MVP.

**Independent Test**: Abrir la app vacía, registrar un gasto y verlo listado con sus datos.

**Acceptance Scenarios**:

1. **Given** la app sin movimientos, **When** registro un gasto de 25.000 con fecha de hoy y
   categoría "Alimentación", **Then** el gasto aparece en la lista con monto, fecha y categoría.
2. **Given** el formulario de nuevo gasto, **When** dejo el monto vacío, en cero o negativo,
   **Then** no se guarda y se muestra "El monto debe ser mayor que cero".
3. **Given** el formulario de nuevo gasto, **When** no selecciono categoría, **Then** no se guarda
   y se indica que la categoría es obligatoria.
4. **Given** el formulario de nuevo gasto, **When** no cambio la fecha, **Then** se usa la fecha de
   hoy por defecto.

---

### User Story 2 - Registrar un ingreso (Priority: P1)

Como persona que recibe dinero (salario, ventas, regalos), quiero registrar un ingreso, para
conocer cuánto dinero entra.

**Why this priority**: Junto con los gastos permite calcular el saldo, que es el dato que el
usuario más consulta.

**Independent Test**: Registrar un ingreso y verlo en la lista marcado como ingreso.

**Acceptance Scenarios**:

1. **Given** la app abierta, **When** registro un ingreso de 2.000.000 con categoría "Salario",
   **Then** aparece en la lista identificado visualmente como ingreso (signo + y color distinto).
2. **Given** el formulario, **When** cambio el tipo de "Gasto" a "Ingreso", **Then** solo se
   ofrecen categorías de ingreso.

---

### User Story 3 - Ver y filtrar el historial de movimientos (Priority: P2)

Como usuario, quiero ver mis movimientos ordenados por fecha y filtrarlos por mes y tipo, para
revisar lo que pasó en un periodo.

**Why this priority**: Con pocos movimientos la lista simple basta; el filtro gana valor a medida
que crecen los datos.

**Independent Test**: Con movimientos en dos meses distintos, filtrar por un mes y ver solo los de
ese mes con el total del periodo.

**Acceptance Scenarios**:

1. **Given** movimientos en septiembre y octubre, **When** selecciono octubre, **Then** solo veo
   los de octubre, del más reciente al más antiguo.
2. **Given** el filtro de octubre, **When** selecciono el tipo "Gasto", **Then** solo veo gastos y
   el total de gastos del mes.
3. **Given** un mes sin movimientos, **When** lo selecciono, **Then** veo el mensaje
   "No hay movimientos en este periodo".

---

### User Story 4 - Editar un movimiento (Priority: P2)

Como usuario, quiero corregir un movimiento que registré mal, para que mis cifras sean reales.

**Why this priority**: Los errores de digitación son frecuentes, pero el usuario puede
eliminar y volver a crear mientras tanto.

**Independent Test**: Editar el monto de un movimiento y verificar que la lista refleja el cambio.

**Acceptance Scenarios**:

1. **Given** un gasto de 25.000, **When** cambio el monto a 52.000 y guardo, **Then** la lista
   muestra 52.000.
2. **Given** la edición de un movimiento, **When** pongo un monto inválido, **Then** se rechaza con
   el mismo mensaje que al crear y el valor original se conserva.

---

### User Story 5 - Eliminar un movimiento (Priority: P3)

Como usuario, quiero eliminar un movimiento duplicado o erróneo, para que no afecte mis totales.

**Why this priority**: Menos frecuente que crear o editar.

**Independent Test**: Eliminar un movimiento confirmando y comprobar que ya no aparece.

**Acceptance Scenarios**:

1. **Given** un movimiento en la lista, **When** pulso eliminar y confirmo, **Then** desaparece de
   la lista y de los totales.
2. **Given** el diálogo de confirmación, **When** cancelo, **Then** el movimiento se conserva.

---

### Edge Cases

- Monto con más de 2 decimales o con separadores de miles: se normaliza o se rechaza con mensaje.
- Monto mayor a 999.999.999.999: se rechaza.
- Fecha futura: se permite (gastos programados), pero se muestra marcada como futura.
- Nota de más de 200 caracteres: se rechaza indicando el límite.
- Doble clic en "Guardar": se crea un solo movimiento.
- El servidor no responde: se muestra un error y los datos del formulario no se pierden.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir crear un movimiento con tipo (ingreso/gasto), monto, fecha,
  categoría y nota opcional.
- **FR-002**: El sistema DEBE rechazar montos vacíos, no numéricos, menores o iguales a cero o
  mayores a 999.999.999.999.
- **FR-003**: El sistema DEBE exigir una categoría compatible con el tipo del movimiento.
- **FR-004**: El sistema DEBE usar la fecha actual como valor por defecto.
- **FR-005**: El sistema DEBE listar los movimientos ordenados por fecha descendente.
- **FR-006**: Los usuarios DEBEN poder filtrar los movimientos por mes y por tipo y ver el total
  del filtro aplicado.
- **FR-007**: Los usuarios DEBEN poder editar todos los campos de un movimiento existente con las
  mismas validaciones de la creación.
- **FR-008**: Los usuarios DEBEN poder eliminar un movimiento previa confirmación.
- **FR-009**: El sistema DEBE conservar los movimientos al cerrar y volver a abrir la aplicación.
- **FR-010**: El sistema DEBE mostrar los montos en formato de moneda local (COP, separador de
  miles).

### Key Entities

- **Movimiento**: tipo (ingreso/gasto), monto, fecha, categoría, nota, fecha de creación.
- **Categoría**: nombre y tipo (ingreso/gasto). En esta funcionalidad se usa un conjunto
  predefinido; su gestión se especifica en `002-gestion-categorias`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario nuevo registra su primer gasto en menos de 30 segundos sin ayuda.
- **SC-002**: El 100 % de los montos inválidos de los escenarios es rechazado con un mensaje claro.
- **SC-003**: La lista filtrada por mes aparece en menos de 1 segundo con 5.000 movimientos.
- **SC-004**: El total mostrado para un filtro coincide al centavo con la suma manual de sus
  movimientos.

## Assumptions

- Usuario único, sin inicio de sesión (constitución, principio V).
- Moneda única COP; no hay conversión de divisas.
- Categorías predefinidas iniciales: Gasto → Alimentación, Transporte, Vivienda, Servicios, Salud,
  Entretenimiento, Otros; Ingreso → Salario, Ventas, Regalos, Otros.
- No hay movimientos recurrentes ni importación de extractos bancarios en esta versión.
