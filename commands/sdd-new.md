---
description: Arranca un cambio SDD nuevo en openspec/changes/<nombre>/ y lo lleva hasta tasks, pausando antes de apply para que el usuario apruebe el plan.
argument-hint: nombre del cambio en kebab-case
---

Arrancar un cambio SDD nuevo y llevarlo hasta la fase `tasks`.

Argumento: `$ARGUMENTS` = nombre del cambio en kebab-case.

## Antes de actuar

Si el nombre ya existe bajo `openspec/changes/`, **pará**: o es un `/sdd-continue`, o el
nombre está mal. Si el proyecto tiene `docs/decisions/`, `docs/specs/` o un índice de
documentación propio, revisalos antes de improvisar un procedimiento propio.

Si el repositorio tiene remoto, buscá el nombre también ahí, porque un compañero puede
tenerlo abierto en una rama sin mergear: `git fetch`, después
`git ls-tree -d origin/<rama principal> openspec/changes/<nombre>` y
`git branch -r --list "*<nombre>*"`. Si aparece, **pará** igual que en local y decí dónde
está. Dos cambios con el mismo nombre chocan recién en el merge, cuando ya hay trabajo
hecho en los dos.

## Origen

Un cambio **tiene origen** cuando construye una tarea o un requerimiento de la skill
`flujo-de-requerimientos`. Buscá su registro de trazabilidad: `requerimientos/_registro.md`,
o el `_registro.md` que tenga la línea «Próximo número libre». Si no hay, el cambio no
tiene origen: no preguntes nada y saltá todo lo marcado «con origen». Una pregunta que casi
siempre se responde «no» se aprende a saltar.

Si hay registro, preguntá si el cambio construye una `TAREA-NNN` o, en tamaño Ligera, un
`REQ-NNN`, y cuál. Con origen:

- Leé la tarea, las secciones del PRD que cita (`prd-secciones`) y el REQ. No escribas en
  ninguno de los tres: son de Producto.
- Si la tarea no está en `estado: Lista`, **pará**: especificar sobre un `Borrador` es
  especificar sobre algo que Producto todavía puede cambiar.
- En el frontmatter de `proposal.md`, escribí `tarea: TAREA-NNN` (o `requerimiento:
  REQ-NNN`), `responsable` (quien responde por el área; por defecto,
  `git config user.name`) y `areas-afectadas` (otras áreas cuyo trabajo cambia; `[]` si
  ninguna). Es el reporte del área: lo leen `/sdd-verify` y `/sdd-archive`, y no va en la
  tarea porque la tarea es de otro dueño.
- En el mismo cambio, completá la celda de tu área en la fila del REQ del registro.

## Roles

Leé la sección «Ciclo de vida: roles» del `CLAUDE.md` del proyecto. Si no existe, el modo
es `solo`: ignorá esta sección. En `pareja` o `equipo`:

- Preguntá quién es el **dueño** del cambio (por defecto, `git config user.name`) y
  escribilo como `dueño` en el frontmatter de `proposal.md`.
- En el paso 5, el plan se presenta a quien la tabla de roles designa para aprobarlo, que
  no es el dueño. Decí a quién le toca; no lo des por aprobado porque el dueño dijo que sí.

## Skills relacionadas

- **`flujo-de-requerimientos`** — si este cambio viene de un requerimiento o PRD, es de ahí
  que sale el alcance.
- **`documentar-decisiones`** — antes de proponer algo que huela a decisión, contrastalo
  contra `docs/decisions/`.
- **`escribir-auditoria-tecnica`** — si la fase explore necesita dejar un documento de
  referencia permanente en `docs/` (no obligatorio: el `explore.md` de este comando vive
  dentro del propio cambio).
- La o las skills de implementación y testing propias del stack del proyecto, para las fases
  `design` y `tasks`.

## Instrucciones

0. **explore** → `openspec/changes/<nombre>/explore.md`. Estado actual + enfoques comparados
   (tabla pros/contras/esfuerzo) + recomendación. Lee las fuentes reales, no modifica nada.
   Cada afirmación va con su etiqueta de confianza y su fuente citada con ruta y línea.
1. **propose** → `proposal.md`, **~450 palabras**. El qué y el por qué ahora; alcance in/out;
   **plan de rollback obligatorio**.
2. **spec ‖ design**, a partir del proposal:
   - `spec.md`, **~650 palabras**. Criterios con **MUST/SHOULD** (RFC 2119) y al menos un
     escenario `DADO … CUANDO … ENTONCES …` por criterio verificable. Los criterios no
     automatizables van en su propia checklist de verificación manual. Frontmatter:
     `tipo · id · estado · fase · feature · fecha · resumen`.
   - **Con origen**, `spec.md` abre con la tabla **Criterios de origen**: una fila por
     criterio de la tarea (o del REQ), con el escenario que lo cubre o `hueco declarado` y
     su motivo. Ningún criterio queda sin fila: es el fallo que la cadena existe para
     evitar, y `/sdd-verify` lo comprueba. Recortar alcance no se resuelve acá: se levanta
     contra el dueño del PRD.
   - `design.md`, **~800 palabras**. Qué piezas suma (módulos, componentes, integraciones),
     qué decisiones de arquitectura implica, y si alguna ya está cubierta por un ADR
     existente en `docs/decisions/`.
3. **tasks** → `tasks.md`, **~530 palabras**. Descomposición en **slices verticales** que
   entregan valor de punta a punta.
   - **Partí** un slice si supera unos 3 días de trabajo, si hay funcionalidad satélite
     separable (auditoría, métricas, exportadores), o si hay refinamientos incrementales
     sobre un MVP ya entregable. **No fuerces el split**: si la spec es chica y cohesiva, un
     solo slice es la respuesta correcta; una tarea de menos de medio día es ruido —
     agrupala.
   - Cada tarea cierra con el criterio que la justifica (el `MUST` de la spec). Marcá
     **`[P]`** solo si no depende de nada que otra tarea del cambio todavía tenga que crear.
4. **Frontmatter ligero** en `proposal.md`, `design.md` y `tasks.md`: `tipo: cambio-fase · id
   · fase · estado`; en `proposal.md`, además, `dueño` si el modo no es `solo` y los
   campos de origen si los hay. La fase se declara ahí.
5. **Pausá acá y presentá el plan** — resumen, número de tareas, archivos afectados,
   decisiones abiertas — antes de pasar a `/sdd-apply`. Si el cambio toca datos personales,
   autenticación/autorización, pagos o cualquier dominio regulado, exigí revisión humana
   explícita declarada en la spec.
6. Si un artefacto se pasa de su presupuesto de palabras, es señal de *scope creep*: proponé
   partirlo en dos cambios, **no** recortes contenido a la fuerza.
