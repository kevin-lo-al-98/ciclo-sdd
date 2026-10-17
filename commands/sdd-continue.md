---
description: Retoma un cambio SDD existente desde la fase pendiente, leyéndola del frontmatter de su artefacto más avanzado.
argument-hint: nombre del cambio (la carpeta bajo openspec/changes/)
---

Retomar un cambio SDD donde quedó.

Argumento: `$ARGUMENTS` = nombre del cambio.

## Instrucciones

1. Listá `openspec/changes/<nombre>/`. Si la carpeta no existe → **pará**: o el cambio no
   existe, o el nombre está mal escrito. No lo crees por tu cuenta; eso es `/sdd-new`.
2. **Determiná la fase.** Está en el campo `fase` del frontmatter del artefacto más
   avanzado. Orden de precedencia: `spec.md` → `proposal.md` → `explore.md`. Si el
   frontmatter no declara `fase`, vale el nombre del artefacto presente: `explore.md ·
   proposal.md · spec.md · design.md · tasks.md · apply-progress.md · verify-report.md ·
   archive-report.md`.
3. Si el frontmatter y los archivos se contradicen (dice `fase: spec` pero ya hay
   `tasks.md`), **decilo y preguntá** cuál manda. No lo resuelvas en silencio.
4. Retomá exactamente donde quedó, sin repetir fases completas ni saltarte ninguna:
   `explore → propose → spec ‖ design → tasks → apply → verify → archive`. Los comandos del
   flujo: `/sdd-new` cubre hasta `tasks`, después `/sdd-apply`, `/sdd-verify` y
   `/sdd-archive`.
5. Al avanzar, actualizá `fase` en el frontmatter.
6. Antes de escribir nada, releé `docs/decisions/` si el proyecto las tiene: pudo entrar una
   decisión nueva desde la última vez que se tocó el cambio.
