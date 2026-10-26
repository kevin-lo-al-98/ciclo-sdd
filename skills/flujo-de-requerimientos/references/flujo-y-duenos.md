# La cadena, etapa por etapa

```
        quien pide              producto                 cada área que construye
 ┌──────────────────┐   ┌────────────────────┐   ┌──────────────────────────────┐
 │  REQ-NNN         │ → │  PRD-NNN           │ → │  spec del área  →  código    │
 │  qué problema,   │   │  cómo se comporta  │   │  (en paralelo si hay varias) │
 │  para quién      │   │  el producto       │   └──────────────────────────────┘
 └──────────────────┘   │  TAREA-NNN         │
                        │  entregas verticales│
                        └────────────────────┘
        ▲                          ▲                          ▲
        └──── registro de trazabilidad: una fila, todas las etapas ────┘
```

## Estados del requerimiento

```
Borrador → Recibido → Validado → Aceptado → En PRD → Entregado
                                                  ╲→ Descartado (desde cualquier estado)
```

| Estado | Significa |
|---|---|
| `Borrador` | Lo está escribiendo quien pide; aún no entra al canal |
| `Recibido` | Entró con sus preguntas abiertas declaradas |
| `Validado` | Se confirmó que el enunciado es el problema real |
| `Aceptado` | Las áreas impactadas confirmaron que lo entienden y es viable |
| `En PRD` | Hay un PRD en `Final` que lo destila |
| `Entregado` | Todas sus tareas están entregadas (o descartadas). Lo mueve el dueño del producto, en su propio cambio: no lo mueve el cierre de una spec |
| `Descartado` | Se cerró sin entregar; el motivo queda escrito |

**En la versión ligera** los estados son `Recibido → Aceptado → Entregado | Descartado`:
sin PRD no hay `En PRD`, y la validación y la viabilidad se resumen en una sola
confirmación de quien pide y de quien construye. Sin tareas, `Entregado` es cuando se
archiva la última spec.

Por qué el cierre del REQ es de quien lo posee y no de quien archiva: el cierre de una
spec es un hecho del área que construye, y un REQ puede tener varias tareas y varias
áreas. Si cada archivo de spec pudiera mover el REQ, un cierre parcial lo daría por
entregado.

Antes de llegar al PRD, el requerimiento pasa por **dos puertas, en este orden**:

```
Recibido ──validación──> Validado ──viabilidad──> Aceptado ──> habilita el PRD
```

Validar va **antes** de estimar porque nadie estima la viabilidad de algo que todavía no
se confirmó. Invertir el orden produce estimaciones de problemas que luego cambian.

## Las etapas

### 1. Alta — quien pide

Escribe `REQ-NNN-<slug>` desde [la plantilla](plantilla-requerimiento.md), añade su fila al
[registro](registro-de-trazabilidad.md) y abre el cambio. Se sube **con sus preguntas
abiertas declaradas**.

**Sale con** estado `Recibido`.

### 2. Validación — quien pide, o producto

Confirmar que el problema enunciado **es el problema real**. Todavía no hay software que
probar: validar no es probar, es confirmar el enunciado.

- Si el requerimiento pide una pantalla o una interacción nueva, se valida contra un
  **prototipo** que quien valida vio funcionando y aprobó de forma explícita.
- Si no pide interfaz (una regla de cálculo, un catálogo), se valida **contra quien lo
  pidió**, y queda escrito por qué no hace falta prototipo.
- El veredicto y quién lo da van en la sección «Validación» del REQ y en el registro, en el
  mismo cambio.
- Si no pasa, el REQ **se queda en `Recibido`** con el hallazgo escrito. No se pierde: se
  corrige y se vuelve a validar. Una validación fallida que no queda escrita se repite
  igual dentro de tres meses.

**Sale con** estado `Validado`.

### 3. Viabilidad — las áreas impactadas

Cada área lee el REQ y responde tres cosas: se entiende, es viable, y qué le toca. Lo que
no se entiende se pregunta, y la respuesta **se incorpora al REQ**: el hilo de un cambio no
lo va a leer nadie en seis meses.

El REQ **rebota** al que lo pidió, con el motivo concreto, si:

- trae solución técnica,
- impone un diseño de pantalla como requisito, o
- mezcla más de un problema (si el título necesita una «y», son dos REQ).

**Cuando el REQ vuelve corregido tras un rebote**, ¿hay que repetir las confirmaciones ya
dadas? Se decide mirando el **diff de la corrección**, no el juicio de quien corrigió:

- Si toca el problema o los criterios de aceptación, **todas** las áreas impactadas
  confirman de nuevo: lo que aceptaron era otro enunciado.
- Si no toca ninguno de los dos, confirma de nuevo **solo el área que rebotó**.
- Si se **añaden** áreas a la lista, confirman solo las añadidas. Quitar un área no
  invalida a las que siguen, pero quitarla **para no esperarla** es el antipatrón: un área
  que sí construye no sale de la lista para acelerar el REQ.

Sin esta regla, cada rebote puede reabrir todas las confirmaciones, y un REQ que toca tres
áreas acaba esperando siempre a la más lenta.

**Sale con** estado `Aceptado` y las áreas impactadas confirmadas.

### 4. PRD — producto

Escribe `PRD-NNN-<slug>` citando los REQ de origen. Dos secciones hacen que el PRD sirva y
no haya que volver a preguntar:

- **Reparto entre áreas**: decide cuántas specs salen y evita que dos áreas implementen lo
  mismo o que ninguna implemente el pegamento.
- **Criterios de aceptación**: cada criterio del REQ aparece aquí o está declarado como
  hueco. Un criterio que se pierde en esta transición no vuelve.

Antes de pasar a `Final`, una persona revisa el PRD y deja su veredicto escrito. Esta puerta
es humana, no mecánica: ningún validador sabe si el comportamiento descrito es el correcto.

**Sale con** el PRD en `Final`, el REQ en `En PRD` y la columna PRD del registro completa.

### 5. Tareas — producto

Se parte el PRD en entregas **verticales**: cada una deja un comportamiento observable de
extremo a extremo, no una capa. Una tarea que no cabe en su presupuesto de líneas se
divide. [Plantilla](plantilla-tarea.md).

Dos controles que conviene hacer a mano si la tarea la genera una herramienta o una IA, que
**clasifica sin que nadie compruebe**:

- Las áreas de la tarea salen del reparto del PRD **dentro** de las del REQ. Una tarea que
  nombra un área que el REQ no tiene es una tarea que nadie aceptó.
- El nivel de evidencia (ver [variante con firmas](variante-con-firmas.md)) se baja solo por
  escrito. Si el REQ o el PRD tocan datos sensibles y la tarea sale con el nivel mínimo, es
  un hallazgo, no una preferencia.

**Sale con** cada tarea en `Lista` y su número en la columna Tareas del registro.

### 6. Spec — cada área impactada, en paralelo

Cada área especifica lo suyo con **sus tareas** como entrada y el PRD como contexto. Pueden
ir a la vez: para eso existe el reparto entre áreas.

- Los criterios de las tareas (y los del PRD que citan) se traducen a escenarios
  verificables (`WHEN/THEN`). **Ninguno se descarta** en la traducción.
- Si dos áreas comparten un contrato (la forma de un payload, el nombre de un campo, quién
  calcula qué), se acuerda **antes** de escribir las tareas técnicas. Un contrato acordado
  durante la implementación ya llegó tarde.
- Si la spec necesita una decisión técnica nueva, sale un ADR (`documentar-decisiones`).
- Si el cambio de un área **cambia lo que otra consume** (un contrato compartido, una
  decisión visible desde fuera), se declara al abrirlo y esa otra área lo aprueba. Ver
  [`reporte-del-area.md`](reporte-del-area.md).

Con los comandos SDD, esta etapa es `/sdd-new`: escribe el reporte como frontmatter de
`proposal.md`, abre la spec con la tabla «Criterios de origen» y completa la celda del
registro.

Al abrir la spec, el área crea el **archivo de reporte** de su cambio con la tarea que
construye y quién responde por el área. A partir de ahí, lo que el área tiene que decir
sobre la tarea —avance, responsable, cierre— va **ahí** y no en la tarea. Por qué: ver
[`reporte-del-area.md`](reporte-del-area.md).

**Sale con** la spec aprobada, su archivo de reporte con la tarea y el responsable, y la
celda del registro completa.

### 7. Construcción y verificación — el área que construye

Cada área implementa en su repositorio. **Dos cambios enlazados**: el del documento y el del
código, cada uno apuntando al otro, para que doc y código no se separen. La verificación
rastrea hasta la tarea y el PRD, no solo hasta la spec: con los comandos SDD, la sección
«Trazabilidad» de `/sdd-verify`, donde un criterio de la tarea sin escenario ni hueco
declarado da `FAIL`.

**Sale con** la verificación en verde y, en la variante con firmas, la firma de construcción
en el archivo de reporte. El avance del área en la tarea pasa a «construido» **por derivación**
de eso; el `estado` de la tarea no se mueve, porque es de quien posee la tarea.

### 8. Prueba de usuario — producto

Quien posee la tarea la prueba **como la usaría el usuario**, siguiendo su sección
«Cómo se prueba», y deja su veredicto por escrito. Es la segunda mitad de la doble prueba: el
test de código dice que lo construido hace lo que el desarrollador entendió; esta dice que lo
entendido es lo que se pidió.

- **Aprobada**: la tarea pasa a `Validada`.
- **Aprobada con excepciones**: pasa igual, con el motivo y un plazo de regularización
  escritos. Sin motivo no hay excepción: hay una aprobación que no lo es.
- **Rechazada**: la tarea se queda en `Lista` con la causa en su historial; el área **reabre su
  cambio** y retira su firma de construcción, con lo que su avance vuelve a «en curso».
  Quien rechaza no toca el avance: no es suyo.

### 9. Cierre — el área cierra la tarea, el dueño del producto cierra el REQ

Con la tarea `Validada`, cada área impactada archiva su cambio. Eso es **el área cerrando la
tarea**: el archivo no puede completarse mientras la tarea no esté validada, y no toca ni la
tarea ni el REQ, que son de otro dueño. Con los comandos SDD, `/sdd-archive` comprueba la
validación antes de mover nada.

La tarea queda **entregada sola** cuando cada área impactada cerró su cambio: nadie escribe
«Entregada» en ella. El cierre que deja la última pieza mueve su fila a «entregadas» en el
registro de tareas. Cuando **todas** las tareas del REQ están entregadas (o descartadas), el
dueño del producto pasa el REQ a `Entregado` en su propio cambio.

Por qué se parte así: quien prueba lo construido (etapa 8) es quien sabe si es lo pedido;
quien lo archiva (etapa 9) es quien sabe si quedó consolidado. Que el dueño del producto firme
además el cierre de cada tarea añade una cola que no añade juicio. En una cadena con *N*
tareas, el origen medía 2 + 2*N* firmas del dueño del producto antes de moverlo, y su ausencia
frenaba todos los cierres a la vez; así pasa a 2 + *N*, más la del cierre del REQ.

## Trazabilidad hacia atrás

La cadena tiene que poder recorrerse completa: un escenario de una spec → su criterio del
PRD → su criterio del REQ → el problema de negocio. Si un eslabón no resuelve, el trabajo no
es trazable y eso es un hallazgo de la verificación.

Donde un documento heredado no tiene identificadores citables, el eslabón es la **sección**:
citar «PRD §4.2» cumple la regla. Donde hay identificadores, se exigen.
