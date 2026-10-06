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
| `Entregado` | La última spec derivada está archivada |
| `Descartado` | Se cerró sin entregar; el motivo queda escrito |

**En la versión ligera** los estados son `Recibido → Aceptado → Entregado | Descartado`:
sin PRD no hay `En PRD`, y la validación y la viabilidad se resumen en una sola
confirmación de quien pide y de quien construye.

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

### 6. Spec — cada área impactada, en paralelo

Cada área especifica lo suyo con el PRD como insumo. Pueden ir a la vez: para eso existe el
reparto entre áreas.

- Los criterios del PRD se traducen a escenarios verificables (`WHEN/THEN`).
  **Ninguno se descarta** en la traducción.
- Si dos áreas comparten un contrato (la forma de un payload, el nombre de un campo, quién
  calcula qué), se acuerda **antes** de escribir las tareas técnicas. Un contrato acordado
  durante la implementación ya llegó tarde.
- Si la spec necesita una decisión técnica nueva, sale un ADR (`documentar-decisiones`).

**Sale con** la spec aprobada y su celda del registro completa.

### 7. Entrega y cierre

Cada área implementa en su repositorio. **Dos cambios enlazados**: el del documento y el del
código, cada uno apuntando al otro, para que doc y código no se separen. La verificación
rastrea hasta el PRD, no solo hasta la spec.

Cuando la última spec derivada de un REQ queda archivada, el REQ pasa a `Entregado`.

## Trazabilidad hacia atrás

La cadena tiene que poder recorrerse completa: un escenario de una spec → su criterio del
PRD → su criterio del REQ → el problema de negocio. Si un eslabón no resuelve, el trabajo no
es trazable y eso es un hallazgo de la verificación.

Donde un documento heredado no tiene identificadores citables, el eslabón es la **sección**:
citar «PRD §4.2» cumple la regla. Donde hay identificadores, se exigen.
