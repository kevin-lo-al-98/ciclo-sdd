---
description: Construye la Spec Compliance Matrix de un cambio SDD y emite el veredicto PASS / PASS WITH WARNINGS / FAIL en verify-report.md.
argument-hint: nombre del cambio
---

Verificar un cambio SDD contra su propia spec.

Argumento: `$ARGUMENTS` = nombre del cambio.

## Skills relacionadas

- **`cerrar-plan-o-spec-con-regla-de-oro`**
- **`documentar-decisiones`**

## Roles

Leé la sección «Ciclo de vida: roles» del `CLAUDE.md` del proyecto. Si no existe, el modo
es `solo`: ignorá esta sección. En `pareja` o `equipo`:

- Escribí en el frontmatter de `verify-report.md` `verificado-por: <git config user.name>`.
- Si quien verifica es el `dueño` de `proposal.md` o aparece como autor de la
  implementación en `apply-progress.md`, el veredicto **no puede pasar de PASS WITH
  WARNINGS**. Registralo como hallazgo: «verificado por quien implementó». Quien escribió
  el código comparte sus puntos ciegos, y la matriz confirma lo que ya creía.

## Instrucciones

1. Requiere `spec.md` y `tasks.md`. Generá `openspec/changes/<nombre>/verify-report.md` con
   frontmatter ligero (`tipo: cambio-fase · id · fase: verify · estado`).
2. **Completitud**: n/m tareas de `tasks.md` marcadas `[x]`, y si alguna quedó `[ ]`, cuál y
   por qué.
3. **Build y tests**: corré lo que el proyecto use para validar (tests, build, linter) y
   registrá la salida. Un fallo de build o de test es `CRÍTICO`.
4. **Spec Compliance Matrix** — una fila por escenario `DADO … CUANDO … ENTONCES …` de
   `spec.md`: `COMPLIANT | FAILING | UNTESTED | PARTIAL`, con la evidencia (el test que
   pasó, o la verificación manual para los criterios no automatizables). Cobertura alta con
   asserts vacíos es `UNTESTED`, no cumplimiento.
5. **Trazabilidad (con origen)**: si `proposal.md` declara `tarea` o `requerimiento`,
   agregá la sección `## Trazabilidad`: por cada fila de «Criterios de origen» de
   `spec.md`, su escenario y el estado que le dio la matriz. Releé la tarea (o el REQ): un
   criterio suyo sin fila, o una fila sin escenario ni `hueco declarado`, es `CRÍTICO`. Es
   el fallo que la cadena existe para evitar; si solo avisara, se archivaría igual.
6. **Coherencia**: ¿lo implementado sigue `design.md`? Cualquier desviación que no se haya
   reportado ya en `apply` es un hallazgo acá, y no se omite.
7. **Regla de oro**: si la realidad terminó divergiendo de lo acordado, la spec se actualiza
   en el mismo cambio. Una spec desincronizada es un hallazgo.
8. **Veredicto**: `PASS | PASS WITH WARNINGS | FAIL`. Un solo hallazgo `CRÍTICO` basta para
   `FAIL`.
9. Actualizá `fase: verify` en el frontmatter.
10. Si el proyecto rastrea este cambio en un backlog externo (Jira, ClickUp, Linear, etc.),
   señalá que corresponde actualizar su estado ahí — no lo toques vos mismo salvo que te lo
   pidan explícitamente.
