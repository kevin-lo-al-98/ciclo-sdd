---
description: 'Un diff que añade un ADR y una petición de mensaje de commit. Es trabajo de escribir-mensaje-de-commit: documentar-decisiones no debe dispararse aunque el diff sea un ADR.'
expected_outcome: 'Un mensaje de commit para el diff; documentar-decisiones no se invoca.'
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Redacta el mensaje de commit para este cambio:

```diff
diff --git a/docs/decisions/0004-usar-postgres.md b/docs/decisions/0004-usar-postgres.md
new file mode 100644
--- /dev/null
+++ b/docs/decisions/0004-usar-postgres.md
@@ -0,0 +1,12 @@
+---
+status: accepted
+date: 2026-10-17
+---
+
+# Usar PostgreSQL para el servicio de pedidos
+
+## Context and Problem Statement
+
+Necesitamos transacciones entre pedidos y stock.
+
+## Decision Outcome
```
