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
   · fase · estado`. La fase se declara ahí.
5. **Pausá acá y presentá el plan** — resumen, número de tareas, archivos afectados,
   decisiones abiertas — antes de pasar a `/sdd-apply`. Si el cambio toca datos personales,
   autenticación/autorización, pagos o cualquier dominio regulado, exigí revisión humana
   explícita declarada en la spec.
6. Si un artefacto se pasa de su presupuesto de palabras, es señal de *scope creep*: proponé
   partirlo en dos cambios, **no** recortes contenido a la fuerza.
