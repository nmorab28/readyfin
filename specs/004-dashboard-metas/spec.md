# Feature Specification: Dashboard y metas de ahorro

**Feature Branch**: `004-dashboard-metas`

**Created**: 2026-10-23

**Status**: Draft

**Input**: User description: "Resumen de saldo del mes, gráfico de gastos por categoría y metas de ahorro con progreso."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver el resumen del mes (Priority: P1)

Como usuario, quiero ver al abrir la app mis ingresos, gastos y saldo del mes, para saber en
segundos cómo voy.

**Why this priority**: Es la primera pantalla y la pregunta que el usuario se hace más a menudo.

**Independent Test**: Con ingresos de 2.000.000 y gastos de 1.200.000 en octubre, ver saldo
800.000.

**Acceptance Scenarios**:

1. **Given** ingresos de 2.000.000 y gastos de 1.200.000 en octubre, **When** abro el dashboard en
   octubre, **Then** veo Ingresos 2.000.000, Gastos 1.200.000 y Saldo 800.000.
2. **Given** gastos mayores que ingresos, **When** abro el dashboard, **Then** el saldo se muestra
   negativo y en color de alerta.
3. **Given** el dashboard, **When** cambio al mes anterior, **Then** las cifras corresponden a ese
   mes.
4. **Given** un mes sin movimientos, **When** abro el dashboard, **Then** veo ceros y una
   invitación a registrar el primer movimiento.

---

### User Story 2 - Ver gastos por categoría en un gráfico (Priority: P2)

Como usuario, quiero un gráfico con la distribución de mis gastos del mes por categoría, para
identificar dónde gasto más.

**Why this priority**: Aporta comprensión, pero el resumen numérico ya da el dato clave.

**Independent Test**: Con gastos en 3 categorías, ver el gráfico con 3 segmentos y sus
porcentajes.

**Acceptance Scenarios**:

1. **Given** gastos de 600.000 en Alimentación, 400.000 en Transporte y 200.000 en Ocio, **When**
   veo el gráfico, **Then** muestra 50 %, 33 % y 17 %, ordenados de mayor a menor.
2. **Given** el gráfico, **When** paso el cursor o toco un segmento, **Then** veo el nombre de la
   categoría y el monto.
3. **Given** un mes sin gastos, **When** veo el gráfico, **Then** aparece "Sin gastos este mes"
   en lugar del gráfico.

---

### User Story 3 - Crear una meta de ahorro (Priority: P2)

Como usuario, quiero crear una meta de ahorro con nombre, monto objetivo y fecha límite, para
ahorrar con un propósito.

**Why this priority**: Es la funcionalidad que diferencia la app de un simple registro.

**Independent Test**: Crear la meta "Viaje" por 3.000.000 a junio de 2027 y verla en la lista con
0 % de avance.

**Acceptance Scenarios**:

1. **Given** la pantalla de metas, **When** creo "Viaje" por 3.000.000 con fecha 2027-06-30,
   **Then** aparece con 0 % de avance y el ahorro mensual sugerido para cumplirla.
2. **Given** el formulario, **When** el monto objetivo es ≤ 0 o la fecha límite es pasada,
   **Then** se rechaza indicando el motivo.

---

### User Story 4 - Abonar a una meta y ver su progreso (Priority: P2)

Como usuario, quiero registrar abonos a mi meta, para ver cuánto me falta.

**Why this priority**: Sin abonos la meta no tiene progreso.

**Independent Test**: Abonar 750.000 a una meta de 3.000.000 y ver 25 % y 2.250.000 restantes.

**Acceptance Scenarios**:

1. **Given** la meta "Viaje" de 3.000.000 sin abonos, **When** abono 750.000, **Then** veo 25 %
   de avance y faltan 2.250.000.
2. **Given** una meta con 2.900.000 abonados, **When** abono 200.000, **Then** la meta se marca
   como "Cumplida" con 100 % y se muestra un mensaje de felicitación.
3. **Given** un abono, **When** el monto es ≤ 0, **Then** se rechaza.

---

### User Story 5 - Ver metas en el dashboard (Priority: P3)

Como usuario, quiero ver el progreso de mis metas activas en el dashboard, para tenerlas
presentes.

**Why this priority**: Conveniencia; las metas ya se ven en su propia pantalla.

**Independent Test**: Con 2 metas activas, ver ambas barras de progreso en el dashboard.

**Acceptance Scenarios**:

1. **Given** 2 metas activas y 1 cumplida, **When** abro el dashboard, **Then** veo las 2 activas
   con su porcentaje.

---

### Edge Cases

- Abono que supera lo que falta: se acepta y la meta queda en 100 % (no se muestra > 100 %).
- Meta con fecha límite vencida sin cumplir: se marca "Vencida" pero sigue aceptando abonos.
- Eliminar una meta con abonos: requiere confirmación.
- Los abonos a metas no se cuentan como gastos en el resumen del mes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar ingresos, gastos y saldo del mes seleccionado (mes actual por
  defecto).
- **FR-002**: El sistema DEBE mostrar la distribución porcentual de gastos del mes por categoría,
  ordenada de mayor a menor.
- **FR-003**: Los usuarios DEBEN poder crear, editar y eliminar metas con nombre, monto objetivo
  (> 0) y fecha límite futura.
- **FR-004**: Los usuarios DEBEN poder registrar abonos (> 0) a una meta.
- **FR-005**: El sistema DEBE calcular avance, monto restante y ahorro mensual sugerido
  (restante / meses hasta la fecha límite, redondeado hacia arriba).
- **FR-006**: El sistema DEBE marcar las metas como Activa, Cumplida o Vencida.
- **FR-007**: El dashboard DEBE mostrar el progreso de las metas activas.

### Key Entities

- **Meta de ahorro**: nombre, monto objetivo, fecha límite, estado.
- **Abono**: meta, monto, fecha.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El usuario conoce su saldo del mes en menos de 5 segundos tras abrir la app.
- **SC-002**: Las cifras del dashboard coinciden al centavo con la suma de los movimientos del mes.
- **SC-003**: Un usuario crea una meta y registra un abono en menos de 1 minuto.

## Assumptions

- El saldo es mensual (ingresos − gastos del mes), no un saldo bancario acumulado.
- Los abonos a metas son registros independientes; no descuentan del saldo en esta versión.
- Depende de `001-registro-movimientos` y `002-gestion-categorias`.
