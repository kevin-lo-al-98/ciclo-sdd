---
description: 'Un MR con su spec pegada y un criterio sin cubrir. revisar-mr debe dispararse y detectar el hueco contra la spec.'
expected_outcome: 'La revisión señala que el criterio del límite de 10 000 filas no está implementado.'
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Antes de aprobarlo, ¿este MR cubre lo que pide su spec?

**Spec: exportar pedidos a CSV**

Criterios de aceptación:
1. El CSV tiene las columnas id, cliente, total y fecha.
2. Se puede filtrar por rango de fechas.
3. Si el resultado pasa de 10 000 filas, no se genera el archivo y se avisa al usuario de que acote el rango.

**Diff del MR**

```diff
--- a/src/exportar.js
+++ b/src/exportar.js
@@ -0,0 +1,9 @@
+export function exportarPedidos(db, desde, hasta) {
+  const filas = db.query(
+    'SELECT id, cliente, total, fecha FROM pedidos WHERE fecha BETWEEN ? AND ?',
+    [desde, hasta],
+  );
+  const cabecera = 'id,cliente,total,fecha';
+  const cuerpo = filas.map((f) => [f.id, f.cliente, f.total, f.fecha].join(','));
+  return [cabecera, ...cuerpo].join('\n');
+}
```
