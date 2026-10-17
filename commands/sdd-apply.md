---
description: Ejecuta las tareas pendientes de un cambio SDD y registra el avance en apply-progress.md.
argument-hint: nombre del cambio
---

Implementar las tareas pendientes de un cambio SDD.

Argumento: `$ARGUMENTS` = nombre del cambio.

## Skills relacionadas

- **`cerrar-plan-o-spec-con-regla-de-oro`** — para reportar cualquier desviación respecto de
  `design.md`.
- **`documentar-decisiones`** — antes de agregar una dependencia nueva o tomar una decisión
  de arquitectura no prevista en `design.md`.
- La o las skills de implementación y testing propias del stack del proyecto.

## Roles

Leé la sección «Ciclo de vida: roles» del `CLAUDE.md` del proyecto. Si no existe, el modo
es `solo`: ignorá esta sección. En `pareja` o `equipo`, compará el `dueño` del
frontmatter de `proposal.md` con quien ejecuta (`git config user.name`). Si no coinciden,
**avisá y preguntá** si es un traspaso. Si lo es, registralo en `apply-progress.md`
(`traspaso: <de> → <a>, AAAA-MM-DD`) y actualizá `dueño`. No bloquees: traspasar un
cambio es legítimo; lo que no puede pasar es que dos personas lo trabajen sin saberlo.

## Instrucciones

1. **No hay `apply` sin `spec`.** Si falta `openspec/changes/<nombre>/spec.md`, **pará**. Si
   falta `tasks.md`, tampoco hay nada que aplicar: volvé a `/sdd-new`.
2. Leé `spec.md`, `design.md` y `tasks.md` completos, más las decisiones de
   `docs/decisions/` que apliquen.
3. Recorré las tareas `[ ]` pendientes **en orden**, por slices verticales. Marcá `[x]`
   **solo** cuando exista evidencia que la respalde — un test, una llamada a la
   funcionalidad, un archivo escrito. Nunca marques por adelantado.
4. **Merge, nunca sobrescritura**: si `tasks.md` ya trae tareas `[x]` de una sesión previa,
   no las toques.
5. Escribí `apply-progress.md` con el registro de implementación: qué tarea, qué evidencia.
   Frontmatter ligero: `tipo: cambio-fase · id · fase: apply · estado`.
6. **Toda desviación respecto de `design.md`** —otro enfoque, otro componente— se reporta
   explícitamente al cerrar, nunca se silencia. Si la desviación es la buena, aplicá la
   **regla de oro**: actualizá `spec.md` o `design.md` en el mismo cambio (skill
   `cerrar-plan-o-spec-con-regla-de-oro`).
7. **No refactorices fuera del alcance** declarado en `proposal.md`, y no agregues una
   dependencia nueva sin una decisión ya escrita en `design.md` con su justificación (o un
   ADR, si corresponde).
8. Actualizá `fase: apply` en el frontmatter.
