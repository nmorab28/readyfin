# Quickstart: validar Registro de ingresos y gastos

**Feature**: `001-registro-movimientos` | **Date**: 2026-10-23

Guía para comprobar de punta a punta que la funcionalidad cumple la spec. Contrato de la API en
[contracts/openapi.yaml](contracts/openapi.yaml); entidades y reglas en
[data-model.md](data-model.md).

## Requisitos previos

- Node.js 22 LTS y npm 10 o superior
- Puertos 3001 (API) y 5173 (frontend) libres

## Puesta en marcha

```bash
npm install
npm test        # backend + frontend; debe terminar en verde
npm run dev     # API en :3001 y frontend en :5173
```

La base SQLite se crea en `backend/data/readyfin.sqlite` en el primer arranque, con las categorías
predefinidas. Para empezar de cero, se detiene la app y se borra ese archivo.

## Escenarios de validación

| # | Historia | Pasos | Resultado esperado |
|---|----------|-------|--------------------|
| V1 | RDF-5 | Abrir http://localhost:5173 | La app carga sin errores y la API responde `{"status":"ok"}` en `/api/health` |
| V2 | RDF-6 | Registrar gasto de `25.000`, categoría Alimentación, sin cambiar la fecha | Aparece en la lista con fecha de hoy y `$ 25.000` |
| V3 | RDF-6 | Intentar guardar con monto vacío, `0` y `-5` | No se guarda; mensaje "El monto debe ser mayor que cero" |
| V4 | RDF-6 | Intentar guardar sin categoría | No se guarda; mensaje de categoría obligatoria |
| V5 | RDF-7 | Cambiar el tipo a Ingreso | El selector solo ofrece Salario, Ventas, Regalos, Otros |
| V6 | RDF-7 | Registrar ingreso de `2.000.000` en Salario | Aparece con signo `+` y color de ingreso |
| V7 | RDF-9 | Registrar un gasto con fecha del mes anterior; filtrar por el mes actual | Solo aparecen los del mes actual, del más reciente al más antiguo |
| V8 | RDF-9 | Filtrar por tipo Gasto | Solo gastos; el total coincide con la suma manual |
| V9 | RDF-9 | Elegir un mes sin movimientos | Mensaje "No hay movimientos en este periodo" |
| V10 | FR-009 | Detener `npm run dev`, volver a iniciarlo y recargar | Los movimientos siguen ahí |
| V11 | Edge | Hacer doble clic rápido en Guardar | Se crea un solo movimiento |
| V12 | Edge | Detener solo la API e intentar guardar | Mensaje de error; el formulario conserva los datos |

## Comprobación rápida de la API

```bash
curl http://localhost:3001/api/health
curl "http://localhost:3001/api/categories?type=expense"
curl -X POST http://localhost:3001/api/transactions -H "Content-Type: application/json" -d "{\"type\":\"expense\",\"amountCents\":2500000,\"date\":\"2026-10-23\",\"categoryId\":1}"
curl "http://localhost:3001/api/transactions?month=2026-10"
```

`amountCents: 2500000` equivale a $ 25.000,00.

## Rendimiento (SC-003)

La prueba de integración `transactions.perf.test.js` inserta 5.000 movimientos y comprueba que
`GET /api/transactions?month=…` responde en menos de 1 s.
