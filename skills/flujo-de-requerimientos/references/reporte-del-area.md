# El reporte del área sobre una tarea

La tarea es del **dueño del producto**: solo él escribe en ella. Lo que el área que construye
tiene que decir sobre esa tarea —en qué punto va, quién responde, qué cambio la implementa,
cuándo la cerró— **no se escribe en la tarea**: va en un archivo del cambio de la propia
spec del área.

## Por qué no en la tarea

El diseño inicial del proyecto de origen daba al área campos propios dentro del archivo de
la tarea (`avance`, el enlace a la spec, la firma de construcción). Como la tarea es de otro
dueño, cada vez que el área reportaba abría un cambio aparte que el otro lado tenía que
revisar y que no podía ir junto con su trabajo en la spec. Contando una sola tarea de una
sola área, salían **ocho cambios en serie**, con el revisor cambiando de lado cinco veces.

El dato, además, **ya existe** en la spec del área: la fase en que está, el avance, el cierre.
Copiarlo a la tarea es justo el paso que nadie recuerda hacer, y la copia diverge de la
fuente. La regla general: **lo que se puede derivar no se escribe dos veces**.

Al moverlo, desaparecieron los tres cambios en que el área editaba la tarea y el cierre pasó
al archivado de la spec, que el área hace de todos modos.

## El archivo

Uno por cambio de spec, **igual en todas las áreas**, junto a la spec (o como bloque de su
frontmatter si la spec es un solo archivo). Declara solo lo que el área declara y firma:

```yaml
tarea: TAREA-NNN        # la tarea que construye este cambio
responsable:            # persona del área que responde, desde que se abre el cambio

areas-afectadas: []     # otras áreas cuyo trabajo cambia por este cambio; [] si ninguna
aprobacion-areas:       # una persona de cada área de areas-afectadas
  area-b:

construccion:           # variante con firmas: al terminar, con la verificación en verde
  firmada-por:
  fecha:                # AAAA-MM-DD

cierre:                 # variante con firmas: al archivar
  firmada-por:
  fecha:
```

En la versión completa sin firmas bastan `tarea`, `responsable` y `areas-afectadas`. Los
bloques `construccion`, `cierre` y `aprobacion-areas` son de la
[variante con firmas](variante-con-firmas.md).

**La fase no va aquí.** Se declara en el frontmatter de los documentos de la spec
(`fase: explore | propose | spec | design | tasks | apply | verify | archive`, o las que use
el proyecto), que es donde ya la leen los índices y los comandos. Duplicarla en este archivo
obliga a mantenerla en dos sitios.

## Cómo se deriva el avance

| Situación del área en la tarea | Avance |
|---|---|
| El cambio lleva la firma de construcción | `construido` |
| Sin firma, y la fase es implementación o verificación | `en curso` |
| Sin firma, y la fase es anterior a la implementación | `pendiente` |
| El área impactada no ha abierto ningún cambio que declare la tarea | `pendiente` |
| Varios cambios de la misma área declaran la tarea | El del cambio **menos avanzado** |

Por qué el menos avanzado: una tarea con dos cambios de la misma área no está construida
hasta que lo estén los dos. Tomar el más avanzado diría «construido» con trabajo a medias.

- Una tarea **solo se valida** cuando todas sus áreas impactadas están en `construido`.
- Si el cambio está archivado y no lleva la firma de construcción, es un error: se cerró algo
  que nunca se dio por construido.
- Si la validación rechaza la tarea, el área **reabre su cambio y borra la firma de
  construcción**; el avance vuelve a `en curso` solo, sin que nadie edite la tarea.

## La entrega, derivada

El estado «entregada» de la tarea **no lo escribe nadie**: es consecuencia de que la tarea
esté validada y de que cada área impactada haya firmado el cierre de su cambio. El cambio que
da el último cierre mueve la fila de la tarea de «activas» a «entregadas» en el registro de
tareas, y lo hace el área que da esa firma.

Por qué quien mueve la fila es el último en cerrar: es el único que sabe que acaba de
completar la entrega, y dejarlo para el dueño de la tarea es el paso que se olvida. Si aun así
se olvida —una tarea entregada con su fila todavía en «activas»—, debe ser un **aviso**, no
un error que bloquee el cambio de una persona ajena.

## Cuando un cambio afecta a otra área

Un cambio de un área puede cambiar lo que otra construye: el contrato de una API que consume
el front, una decisión de base de datos que cambia un flujo. Cada área revisa su propia spec y
su propio código, así que nada obliga a que la afectada lo vea antes de integrarlo, y nadie
sabe a quién avisar porque **la dependencia no está escrita en ningún sitio**.

- **Se declara donde nace.** El archivo de reporte lleva `areas-afectadas`. La lista vacía
  declara «no afecta a ninguna»; un archivo **sin el campo** no declara nada y su cambio no se
  integra. Un cambio que toca un contrato compartido declara afectada, como mínimo, a la otra
  parte del contrato.
- **Firma cada área declarada**, con el nombre de una persona de esa área, en
  `aprobacion-areas`. Solo firman las declaradas; la dueña del cambio no firma como afectada.
  La firma aprueba **el efecto sobre su trabajo**, no la autoría.
- **Una decisión técnica que afecta a otra área** se registra a nivel de proyecto, no dentro
  de la carpeta del área que la origina, y declara las áreas afectadas en el propio ADR,
  con la firma de cada una.
- **El cambio de código** de cada repositorio enlaza el cambio documental y hereda de él la
  aprobación: no pide una segunda firma. Es el único punto donde los repositorios ya se
  tocan, así que es donde la aprobación queda escrita una vez.

Por qué escribir la firma en el archivo y no apoyarse solo en el revisor por propietario de la
plataforma: esa revisión suele no ser bloqueante en los planes básicos, y los grupos que
nombra pueden no existir —el proyecto de origen lo comprobó—, con lo que la capa de revisión
está apagada **sin aviso**. Una firma escrita en un campo se puede comprobar por presencia, y
funciona con cualquier plataforma.

## Lo que esto no resuelve

El proyecto de origen decidió este diseño después de auditar el flujo en papel; **todavía no
lo había recorrido con una tarea real**. Trátalo como una hipótesis mejor razonada que la
primera, no como una práctica probada.
