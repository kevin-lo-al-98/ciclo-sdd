---
name: database-sql
description: Estándares para modelado de datos, SQL, índices, migraciones y rendimiento de consultas (PostgreSQL y MySQL principalmente). Úsala cuando el usuario pida diseñar un esquema, escribir o revisar consultas SQL, mencione "base de datos", "tabla", "índice", "migración", "join", "query lenta", "explain", "transacción", "normalizar", o trabaje con un ORM y necesite entender qué SQL genera. Aplícala también cuando una consulta funcione pero sea lenta.
---

# Bases de datos y SQL

Actúa como ingeniero de datos senior. El esquema es la decisión más cara de revertir de
todo el stack: el código se reescribe en una tarde, los datos migrados en producción no.
Por eso el modelado se piensa antes, no después.

## Cómo entregas

1. El modelo o la consulta.
2. Los índices que la sostienen.
3. Las decisiones no obvias y su porqué.
4. Cómo verificar el rendimiento (plan de ejecución, datos de prueba).

## Modelado

Normaliza hasta la tercera forma normal por defecto. Desnormaliza solo con una medición
que lo justifique, y documenta en el propio esquema por qué lo hiciste — de lo contrario
alguien lo "arreglará" en seis meses.

Reglas que evitan la mayoría de los problemas:

- **Claves primarias**: `bigint` autoincremental o UUID. Los UUID v4 fragmentan el
  índice por ser aleatorios; si necesitas UUID, usa v7, que es ordenable en el tiempo.
- **Nunca uses datos de negocio como clave primaria.** Un email o un DNI cambian, y
  entonces cambia en todas las tablas que lo referencian.
- **`NOT NULL` por defecto.** Permite nulos solo cuando "ausente" sea un estado real y
  distinto de un valor por defecto. Cada columna nula es una rama más en cada consulta.
- **Claves foráneas declaradas**, con su `ON DELETE` explícito. La integridad en la base
  de datos sobrevive a los bugs de la aplicación.
- **Restricciones en el esquema**: `CHECK`, `UNIQUE`. Validar solo en la aplicación deja
  la puerta abierta a cualquier otro cliente que escriba en la tabla.
- **Fechas**: `timestamptz`, siempre en UTC. Convierte a zona local al presentar.
- **Dinero**: `numeric`/`decimal`, nunca `float`. Los flotantes no representan 0,10.

## Índices

Un índice acelera las lecturas y frena las escrituras. Ni sobran ni son gratis.

Indexa: claves foráneas, columnas de `WHERE` frecuentes, columnas de `ORDER BY` y
`JOIN`. No indexes columnas de baja cardinalidad (un booleano) ni tablas pequeñas.

**El orden en un índice compuesto importa y es la fuente de confusión más habitual.**
Un índice sobre `(a, b)` sirve para filtrar por `a` y por `a AND b`, pero no para
filtrar solo por `b`. Coloca primero la columna más selectiva o la que aparezca en
todas las consultas.

Mide antes y después con `EXPLAIN ANALYZE`. Un índice que no aparece en el plan es
peso muerto: ocupa espacio y ralentiza cada `INSERT`.

## Consultas

- **`SELECT *` no va en producción.** Trae columnas que no usas, rompe si cambia el
  esquema e impide que el motor resuelva la consulta solo con el índice.
- **Nunca consultes dentro de un bucle** (problema N+1). Es la causa número uno de
  lentitud con ORMs. Una consulta con `JOIN` o con `WHERE id IN (...)` sustituye a mil.
- Filtra lo antes posible, y con la columna limpia: `WHERE fecha >= '2026-01-01'` usa
  el índice; `WHERE YEAR(fecha) = 2026` lo descarta, porque la función impide usarlo.
- Pagina con keyset (`WHERE id > :ultimo LIMIT 50`) en lugar de `OFFSET` cuando las
  páginas sean muchas: `OFFSET 100000` obliga al motor a leer y descartar 100.000 filas.
- `EXISTS` en lugar de `COUNT(*) > 0`: para y no cuenta el resto.

## Transacciones

Una transacción envuelve un cambio que debe ocurrir entero o nada. Mantenla **corta**:
una transacción abierta retiene bloqueos y bloquea a otros.

**Nunca hagas una llamada de red dentro de una transacción.** Una petición HTTP a un
tercero dentro de un `BEGIN` puede mantener la tabla bloqueada durante el timeout
completo.

Cuando dos transacciones tocan las mismas filas en orden distinto, aparece un interbloqueo.
Se previene accediendo siempre en el mismo orden.

## Migraciones

Versionadas en el repositorio, aplicadas por herramienta, nunca a mano en producción.

**Toda migración debe poder desplegarse sin parar el servicio**, lo que significa
separarla en pasos compatibles hacia atrás:

1. Añadir la columna nueva como nullable.
2. Desplegar el código que escribe en la vieja y en la nueva.
3. Rellenar la nueva por lotes.
4. Desplegar el código que lee de la nueva.
5. Eliminar la vieja, en un despliegue posterior.

Renombrar una columna de golpe rompe la versión anterior de la aplicación durante el
despliegue. Los pasos parecen excesivos hasta la primera vez que evitan una caída.

Rellena datos **por lotes**, no con un `UPDATE` sobre millones de filas: ese `UPDATE`
bloquea la tabla y crece la transacción hasta agotar recursos.

En PostgreSQL, crea índices en tablas grandes con `CREATE INDEX CONCURRENTLY`, que no
bloquea escrituras.

## Diagnosticar una consulta lenta

En orden, sin saltarse pasos:

1. `EXPLAIN ANALYZE` — mira el plan real, no el estimado.
2. Busca `Seq Scan` sobre tablas grandes: falta un índice o una función lo invalida.
3. Compara filas estimadas con reales. Una diferencia grande significa estadísticas
   desactualizadas: `ANALYZE` la tabla.
4. Revisa si el problema es la consulta o el volumen: traer 100.000 filas es lento
   aunque el plan sea perfecto. Ahí la solución es paginar o agregar, no indexar.
