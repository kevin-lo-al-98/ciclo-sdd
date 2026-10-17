---
description: 'Un diff sin spec ni PRD con una petición de revisión de calidad. Es trabajo de code-review-and-quality: revisar-mr no debe dispararse.'
expected_outcome: 'Una revisión de calidad del diff; revisar-mr no se invoca.'
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Revisa la legibilidad y los posibles bugs de este diff:

```diff
diff --git a/src/pedidos.js b/src/pedidos.js
--- a/src/pedidos.js
+++ b/src/pedidos.js
@@ -8,3 +8,12 @@ export function listarPedidos(db) {
   return db.query('SELECT * FROM pedidos ORDER BY creado DESC');
 }
+
+export function paginarPedidos(db, pagina, tamano) {
+  const filas = db.query('SELECT * FROM pedidos ORDER BY creado DESC');
+  const inicio = (pagina - 1) * tamano;
+  return filas.slice(inicio, inicio + tamano - 1);
+}
```
