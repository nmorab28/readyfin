# Feature Specification: Presupuesto mensual por categoría

**Feature Branch**: `003-presupuesto-mensual`

**Created**: 2026-10-23

**Status**: Draft

**Input**: User description: "Definir un límite mensual por categoría de gasto y recibir una alerta al acercarse o superarlo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Definir el presupuesto de una categoría (Priority: P1)

Como usuario, quiero fijar cuánto puedo gastar al mes en una categoría, para tener un límite claro.

**Why this priority**: Sin límites definidos no hay nada que comparar ni alertar.

**Independent Test**: Asignar 600.000 a "Alimentación" para octubre y verlo en la pantalla de
presupuesto.

**Acceptance Scenarios**:

1. **Given** la pantalla de presupuesto de octubre, **When** asigno 600.000 a "Alimentación",
   **Then** la categoría muestra límite 600.000.
2. **Given** un presupuesto existente, **When** cambio el monto a 700.000, **Then** se reemplaza el
   límite (no se crea un segundo presupuesto).
3. **Given** el formulario, **When** ingreso un monto menor o igual a cero, **Then** se rechaza.
4. **Given** categorías de ingreso, **When** abro la pantalla de presupuesto, **Then** no se
   ofrecen (el presupuesto aplica solo a gastos).

---

### User Story 2 - Ver el avance del presupuesto (Priority: P1)

Como usuario, quiero ver cuánto llevo gastado frente al límite de cada categoría, para decidir si
puedo seguir gastando.

**Why this priority**: Es el valor real del presupuesto: comparar plan con realidad.

**Independent Test**: Con límite de 600.000 y gastos de 450.000 en el mes, ver 75 % usado y
150.000 disponibles.

**Acceptance Scenarios**:

1. **Given** límite 600.000 y gastos del mes por 450.000, **When** abro el presupuesto, **Then**
   veo gastado 450.000, disponible 150.000 y 75 % de avance.
2. **Given** gastos de otro mes en la misma categoría, **When** veo el mes actual, **Then** esos
   gastos no cuentan.
3. **Given** un gasto nuevo en la categoría, **When** vuelvo al presupuesto, **Then** el avance se
   actualiza.

---

### User Story 3 - Recibir alerta al acercarse o superar el límite (Priority: P2)

Como usuario, quiero que la app me avise cuando llegue al 80 % y cuando supere el 100 % del
presupuesto, para reaccionar a tiempo.

**Why this priority**: Aumenta el valor del presupuesto, pero el avance visible ya permite actuar.

**Independent Test**: Registrar un gasto que lleve la categoría del 70 % al 85 % y ver la alerta.

**Acceptance Scenarios**:

1. **Given** una categoría al 70 %, **When** registro un gasto que la lleva al 85 %, **Then** se
   muestra "Has usado el 85 % de tu presupuesto de Alimentación" y la barra cambia a color de
   advertencia.
2. **Given** una categoría al 95 %, **When** registro un gasto que la lleva al 110 %, **Then** se
   muestra "Superaste tu presupuesto de Alimentación por 60.000" y la barra se ve en color de
   error.
3. **Given** una categoría sin presupuesto, **When** registro gastos, **Then** no se muestra
   ninguna alerta.

---

### User Story 4 - Copiar el presupuesto del mes anterior (Priority: P3)

Como usuario, quiero copiar los límites del mes anterior al mes nuevo, para no volver a
digitarlos.

**Why this priority**: Comodidad; se puede definir a mano.

**Independent Test**: En un mes sin presupuesto, pulsar "Copiar del mes anterior" y ver los
mismos límites.

**Acceptance Scenarios**:

1. **Given** noviembre sin presupuesto y octubre con 3 límites, **When** copio, **Then**
   noviembre tiene los mismos 3 límites.
2. **Given** noviembre ya tiene un límite para "Transporte", **When** copio, **Then** ese límite
   se conserva y solo se agregan los que faltan.

---

### Edge Cases

- Editar o eliminar un gasto pasado recalcula el avance de ese mes.
- Avance superior a 100 %: la barra se muestra llena y el texto indica el exceso.
- Categoría con presupuesto eliminada: su presupuesto desaparece (ver `002`).
- Montos en centavos: el porcentaje se redondea a entero solo en la presentación.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Los usuarios DEBEN poder definir un límite mensual (> 0) por categoría de gasto y
  mes.
- **FR-002**: El sistema DEBE permitir a lo sumo un límite por categoría y mes.
- **FR-003**: El sistema DEBE calcular gastado, disponible y porcentaje usando solo los gastos de
  esa categoría en ese mes calendario.
- **FR-004**: El sistema DEBE mostrar una advertencia al alcanzar o superar el 80 % y una alerta de
  exceso al superar el 100 %.
- **FR-005**: Los usuarios DEBEN poder copiar los límites del mes anterior sin sobrescribir los
  existentes.
- **FR-006**: Los usuarios DEBEN poder eliminar un límite.

### Key Entities

- **Presupuesto**: categoría de gasto, mes (año-mes), monto límite.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El porcentaje y disponible mostrados coinciden al centavo con el cálculo manual.
- **SC-002**: La alerta aparece inmediatamente después de guardar el gasto que cruza el umbral.
- **SC-003**: Un usuario define presupuestos para 5 categorías en menos de 2 minutos.

## Assumptions

- Umbrales fijos: 80 % (advertencia) y 100 % (exceso); no configurables en esta versión.
- Las alertas se muestran dentro de la app; no hay correo ni notificaciones push.
- Depende de `001-registro-movimientos` y `002-gestion-categorias`.
