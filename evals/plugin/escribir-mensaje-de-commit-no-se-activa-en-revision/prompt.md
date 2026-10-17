---
description: 'Un diff pegado con una petición de revisión antes de commitear. Es trabajo de code-review-and-quality: escribir-mensaje-de-commit no debe dispararse.'
expected_outcome: 'Una revisión que encuentra que slice devuelve una fila de menos; escribir-mensaje-de-commit no se invoca.'
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Antes de commitearlo, revisa este diff: ¿hay algún bug?

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
