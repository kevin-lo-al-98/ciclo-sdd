---
description: Explora un tema con evidencia real, sin arrancar el cambio. Fase previa a /sdd-new para decidir si vale la pena abrir un cambio SDD.
argument-hint: tema, pregunta o ruta a un documento a explorar
---

Explorar `$ARGUMENTS` con evidencia real, **sin** crear el cambio.

Este comando es **solo lectura**: no crea `openspec/changes/<nombre>/` ni escribe
`explore.md`. Su resultado es desechable y no es un artefacto del pipeline SDD.

## Antes de leer a mano

Si el proyecto ya tiene `docs/decisions/` y `docs/specs/` (skill `adoptar-estructura-de-docs`)
o un índice propio de documentación, empezá por ahí en vez de abrir el árbol completo a mano.
Para barridos amplios ("¿dónde se menciona X en todo el repo?"), delegá en un subagente de
exploración en vez de leer todo vos mismo.

## Skills relacionadas

- **`flujo-de-requerimientos`** — si el alcance viene de un requerimiento o PRD ya escrito.
- **`escribir-auditoria-tecnica`** — si el resultado de esta exploración se va a dejar como
  documento de referencia permanente, no solo en la conversación.
- **`documentar-decisiones`** — para contrastar lo que encontrás contra decisiones ya tomadas
  (ADRs `accepted`) antes de proponer nada.

## Instrucciones

1. **Material de entrada.** Si `$ARGUMENTS` referencia archivos o rutas, leelos primero. Si
   no, tratá `$ARGUMENTS` como el tema a explorar.
2. **Cuidado con fuentes pesadas.** Un archivo de varios miles de líneas no se lee entero:
   usá `Grep` o `Read` con rango (`offset`/`limit`).
3. **Contrastá, no listes ideas.** Para cada pieza relevante, fijá su estado con evidencia y
   etiqueta de confianza: `[confirmado en el código]` · `[en spec/ADR]` ·
   `[conocimiento del equipo, sin verificar]` · `[no confirmado]`. Si el material de entrada
   asume algo que una spec o un ADR contradice, decilo explícitamente.
4. **Jerarquía de fuentes.** Las specs y ADRs mandan sobre prototipos, mockups o
   documentación informal; estos últimos son insumo, no decisión.
5. **Salida, en la conversación** (no en un archivo):
   - Qué existe hoy, pieza por pieza, con evidencia y nivel de confianza.
   - Dos o tres candidatos de enfoque, comparados por esfuerzo y riesgo.
   - Decisiones abiertas que bloquean el diseño, separadas de las que se pueden diferir.
   - Qué no se puede evaluar sin más información, y a quién preguntarle.
6. **No avances de fase.** Si el usuario decide continuar, el siguiente paso es
   `/sdd-new <nombre-del-cambio>`, que corre su propio explore dentro del cambio.
7. Si el tema toca datos personales, autenticación/autorización, pagos o cualquier dominio
   regulado, dejá dicho que la spec va a exigir revisión humana explícita.
