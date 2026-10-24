# Configuración de Jira — ReadyFin (RDF)

Cómo está y cómo debe quedar el proyecto **RDF** en https://nmorab28.atlassian.net para que el
tablero refleje los acuerdos de la [constitución](../.specify/memory/constitution.md) y el
[backlog](backlog.md).

El proyecto es *team-managed*: la configuración se hace desde el tablero o desde
**Configuración del espacio**. La API de Atlassian no permite cambiar columnas, límites de WIP ni
filtros, así que estos pasos son manuales.

## Estado verificado (2026-10-23)

| Revisión | Estado |
|----------|--------|
| Flujo de 4 estados, sin "Bloqueado" | ✅ Por hacer → En curso → En revisión → Listo |
| Orden del backlog (Rank) igual a `docs/backlog.md` | ✅ |
| Toda historia tiene épica padre | ✅ |
| Toda historia tiene criterios Given/When/Then | ✅ |
| Resúmenes escritos como oraciones | ✅ |
| Sprint 1 con un único objetivo y fechas | ✅ Planificado, sin iniciar |
| Web link de RDF-1 a la spec y el plan | ⚠️ Apunta a la rama `docs/RDF-1-plan-registro-movimientos`; cambiarlo a `main` antes de borrar esa rama |

## Pasos pendientes

### 1. Columnas y estados

- Renombrar columnas (clic en el nombre): **Por hacer · En curso · En revisión · Hecho**.
- Renombrar el estado "Listo" a "Hecho": Configuración del espacio → Tipos de trabajo → Editar
  flujo de trabajo.

Motivo: la Definition of Done de la constitución habla de "Hecho"; columna, estado y documento
deben decir lo mismo.

### 2. Límites de WIP

Menú `···` de la columna → **Establecer límite de columna**:

| Columna | Límite | Motivo |
|---------|--------|--------|
| En curso | 2 | Constitución: WIP en curso ≤ 2 |
| En revisión | 2 | La cola de revisión es donde más se pierde tiempo de ciclo |

Regla del equipo: con una columna llena no se empieza nada nuevo; se ayuda a terminar o se revisa.

### 3. Estimación

Configuración del espacio → Funciones → **Estimación**: desactivar. No se usan story points; el
pronóstico se hace contando historias terminadas por sprint, y cada historia se divide para
terminarse en 2 días o menos.

### 4. Filtros compartidos

Filtros → Búsqueda avanzada → pegar el JQL → **Guardar filtro** → compartir con el proyecto RDF.
Todos usan `statusCategory`, así que siguen funcionando aunque se renombren los estados.

| Filtro | JQL |
|--------|-----|
| RDF · Sprint actual | `project = RDF AND sprint in openSprints() ORDER BY Rank ASC` |
| RDF · Mi trabajo | `project = RDF AND assignee = currentUser() AND sprint in openSprints() AND statusCategory != Done` |
| RDF · Cola de revisión | `project = RDF AND sprint in openSprints() AND status = "En revisión" ORDER BY created ASC` |
| RDF · Estancados | `project = RDF AND sprint in openSprints() AND statusCategory = "In Progress" AND updated <= -2d` |
| RDF · Sin épica | `project = RDF AND issuetype != Epic AND parent IS EMPTY AND statusCategory != Done` |
| RDF · Próximo sprint | `project = RDF AND sprint IS EMPTY AND statusCategory = "To Do" ORDER BY Rank ASC` |

"Estancados" usa 2 días porque el sprint dura una semana. "Cola de revisión" se consulta antes de
empezar cualquier trabajo nuevo.

### 5. Tarjetas

Opciones de vista del tablero: mostrar **Etiquetas** y **Épica**, para ver en cada tarjeta a qué
spec pertenece (`spec-001` … `spec-004`) y su prioridad (`P1` … `P3`).

### 6. Iniciar el Sprint 1

Lunes 2026-10-26: Backlog → **Iniciar sprint**. El objetivo y las fechas ya están cargados.

### 7. Informes

| Usar | Para qué |
|------|----------|
| Diagrama de flujo acumulado | Ver dónde se acumula el trabajo; una franja que se ensancha es un cuello de botella |
| Informe de tiempo de ciclo | Mirar percentiles 50/85, no el promedio |

La velocidad no se usa como métrica: no se estiman puntos y no sale del equipo.

### 8. Integración con GitHub

1. Aplicaciones → Explorar más aplicaciones → **GitHub for Atlassian** → instalar.
2. Conectar la cuenta `nmorab28` con acceso solo al repositorio `readyfin`.
3. Ramas, commits y PR con la clave (`feat/RDF-6-…`, `feat(RDF-6): …`) aparecen en el panel de
   desarrollo de la historia.

No activar transiciones automáticas por *smart commits*: una historia pasa a Hecho cuando cumple la
Definition of Done, no cuando llega un commit.

## Convenciones de uso

- **Asignación**: se asigna una historia cuando alguien la toma, no al planificar el sprint.
- **Un solo responsable** por issue.
- **Criterios de aceptación en el issue**, no en chats ni en comentarios del PR.
- **Sin criterios de aceptación no hay sprint**: una historia sin Given/When/Then no entra al sprint.
- **Un PR por historia**, con la clave en la rama, el commit y el título.
