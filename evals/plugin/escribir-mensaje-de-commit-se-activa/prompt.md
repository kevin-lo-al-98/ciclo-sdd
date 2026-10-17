---
description: 'Trabajo terminado y un diff pegado. escribir-mensaje-de-commit debe dispararse y proponer un mensaje con Conventional Commits.'
expected_outcome: 'Un mensaje con tipo y alcance de Conventional Commits que describe la paginación añadida.'
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Listo, esto ya está. Redacta el mensaje de commit:

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
