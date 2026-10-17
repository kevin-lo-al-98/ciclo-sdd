---
name: flujo-de-requerimientos
description: EXPERIMENTAL. Monta y sigue una cadena documental de requerimiento a spec —requerimiento (REQ), PRD, tarea y spec— con un dueño por etapa, plantillas y una única tabla de trazabilidad. Úsala cuando el usuario diga "dar de alta un requerimiento", "convierte este correo o esta reunión en un requerimiento", "escribe un PRD", "qué número de REQ toca", "plantilla de requerimiento", "plantilla de PRD", "trazabilidad entre requerimiento y spec", "el pedido cambió a mitad de camino", "enmienda de un PRD final", "quién cierra la tarea", "avance de una tarea por área", "quién firma por producto", "quién valida esto antes de especificarlo", o cuando quien pide y quien construye sean personas o áreas distintas y se esté perdiendo alcance entre el pedido y la construcción. No la uses para redactar una spec técnica ni un ADR (`documentar-decisiones`), para un equipo de una sola persona, ni para gestionar tickets o issues en Jira o GitHub.
---

# Flujo de requerimiento a spec

> **Experimental.** El diseño sale de un monorepo documental que lo definió con mucho
> detalle pero que, cuando se leyó (6 y 15 de octubre de 2026), todavía no lo había recorrido
> con trabajo real: sus registros estaban vacíos y su propia auditoría no medía tiempos porque
> no había ninguno. Entre las dos lecturas el diseño cambió bastante (el área reporta fuera de
> la tarea, el cierre se reparte, el PRD admite enmiendas acotadas, producto tiene suplentes):
> mejoró al auditarlo, pero **auditar en papel no es recorrerlo**. Los gates y las plantillas
> son una hipótesis razonada, no una práctica probada. Adóptalo con ese descuento y recorta lo
> que no se justifique al usarlo.

Un requerimiento es el **enunciado del problema**, y el eslabón donde la cadena se rompe
más barato: lo que no se pregunta ahí se descubre tres semanas después, dentro de una
spec, discutiendo alcance. Cada eslabón responde una pregunta distinta y tiene un autor
distinto; si se mezclan, la discusión de solución contamina el enunciado del problema y ya
no se puede volver a discutirlo.

## Idioma

Escribe los documentos en el idioma del proyecto: míralo en su `CLAUDE.md` y en su
documentación existente, y pregunta si no está claro. Las plantillas de las referencias
tienen comentarios guía en español; al rellenarlas, tradúcelos o bórralos. Los
identificadores (`REQ-001`, `PRD-001`, `TAREA-001`) se conservan.

## Dónde termina esta skill y dónde arranca el ciclo de vida SDD

Esta cadena cubre **qué construir**: de un requerimiento a una spec por área, con un dueño
por etapa. De ahí en adelante —**cómo implementarlo**: spec → código → verificación →
archivo— es el trabajo de los comandos `/sdd-explore`, `/sdd-new`, `/sdd-apply`,
`/sdd-verify`, `/sdd-continue` y `/sdd-archive`. Cuando la etapa "Spec" de esta cadena
termina, el siguiente paso natural es `/sdd-new <nombre-del-cambio>` sobre esa spec; no
hace falta reescribirla ni repetir la cadena de nuevo dentro del cambio SDD.

## ¿Te hace falta?

Monta la cadena solo si se cumplen **las dos**:

- Quien **pide** y quien **construye** son personas o áreas distintas.
- Ya se ha perdido alcance entre el pedido y la construcción, o se espera que pase.

Si no, `documentar-decisiones` (ADRs y specs) es suficiente. Cada etapa añade una revisión
y un cambio más: el proyecto de origen contaba al menos seis cambios separados para una
sola tarea de un área. Ese coste solo se compensa cuando hay alguien a quien proteger de
la pérdida de contexto.

## Tres tamaños

Empieza por el más pequeño que cubra el problema. **Añade una etapa solo cuando se haya
perdido algo concreto que esa etapa habría evitado.**

| Tamaño | Artefactos | Cuándo |
|---|---|---|
| **Ligera** | REQ + registro + spec | Cambios con comportamiento obvio; pocas personas |
| **Completa** | REQ + PRD + tarea + spec + registro, y el [reporte del área](references/reporte-del-area.md) en cada cambio de spec | El comportamiento hay que definirlo antes de especificar, o varias áreas implementan partes |
| **Con firmas** | La completa + [firma nominal y frontera](references/variante-con-firmas.md) | Hay obligación de dejar constancia de quién validó qué |

Los tres tamaños son una propuesta de esta librería. El proceso de origen solo tenía la
versión con firmas.

## La cadena

```
REQ-NNN  →  PRD-NNN  →  TAREA-NNN  →  spec de cada área  →  código
quien pide   producto     producto       quien construye       quien construye
```

| Artefacto | Responde | Dueño |
|---|---|---|
| `REQ` | ¿Qué problema hay y para quién? | Quien lo pide |
| `PRD` | ¿Cómo se comporta el producto que lo resuelve? | Producto |
| `TAREA` | ¿Cuál es la unidad de entrega observable? | Producto, **solo él escribe en ella** |
| spec | ¿Qué se construye y cómo se verifica? | Cada área que construye |
| reporte del área | ¿En qué punto va el área y quién responde? | Cada área, en su propia spec |

Etapa por etapa, con los estados del REQ y lo que hace falta para pasar de uno al
siguiente: [`references/flujo-y-duenos.md`](references/flujo-y-duenos.md).

## Las reglas que sostienen la cadena

Cada una evita un fallo concreto; sin su porqué se ignoran en cuanto estorban.

- **Un dueño por etapa.** Un artefacto con dos dueños se pisa: nadie lo corrige porque
  cada uno cree que es del otro.
- **Una sola tabla de trazabilidad, actualizada en el mismo cambio** que crea o mueve el
  artefacto. Los pasos que se dejan «para después» no se hacen, y un registro desactualizado
  es peor que ninguno porque se consulta creyéndolo cierto.
  [`references/registro-de-trazabilidad.md`](references/registro-de-trazabilidad.md).
- **El requerimiento se sube con sus preguntas abiertas declaradas**, no después de
  resolverlas. Un pedido con huecos declarados es utilizable; uno que los esconde, no.
- **«Fuera de alcance» se escribe aunque parezca obvio.** Es el campo que más discusiones
  ahorra después.
- **El requerimiento enuncia el problema, no la solución.** Prueba: se entiende sin nombrar
  una pantalla, una tabla ni un endpoint. Si no la pasa, rebota a quien lo pidió.
- **Se valida antes de estimar viabilidad.** Nadie estima la viabilidad de algo que quien
  lo pidió todavía no confirmó que era el problema real.
- **El PRD manda en el comportamiento y la spec no lo contradice.** Una contradicción se
  levanta contra el dueño del PRD; no se resuelve ajustando la spec en silencio.
  [`references/precedencia-entre-fuentes.md`](references/precedencia-entre-fuentes.md).
- **Ningún criterio de aceptación se pierde en el traspaso.** O aparece en la etapa
  siguiente o queda declarado como hueco. Recortar alcance es potestad del dueño del PRD y
  se escribe en él.
- **Nadie escribe en el archivo de otro dueño.** Si el área tiene que reportar sobre una
  tarea de producto, lo hace en su propia spec y el avance **se deriva**. Cada reporte escrito
  en un archivo ajeno es un cambio aparte que el otro lado tiene que revisar: el origen contó
  ocho cambios en serie para una sola tarea hasta que sacó el reporte de la tarea.
  [`references/reporte-del-area.md`](references/reporte-del-area.md).
- **Lo que se puede derivar no se escribe dos veces.** El avance del área, el enlace tarea ↔
  spec y la entrega de la tarea salen de la spec y de los cierres; copiarlos a otro sitio es
  el paso que nadie recuerda hacer, y la copia diverge.
- **Quien prueba, valida; quien archiva, cierra.** Producto prueba lo construido y valida la
  tarea; el área archiva su cambio y con eso la cierra; producto cierra el REQ. Que producto
  firme además todos los cierres añade cola sin añadir juicio.
- **Un PRD `Final` se enmienda con historial, no se edita en silencio**, y una enmienda que
  solo toca secciones nombradas no cuesta lo mismo que una que cambia la capacidad.
  [`references/cuando-cambia-el-pedido.md`](references/cuando-cambia-el-pedido.md).

## Cómo se trabaja cada etapa

| Etapa | Qué haces | Plantilla |
|---|---|---|
| **Alta** | Entrevista a quien pide, escribe el REQ y añade su fila al registro en el mismo cambio | [`plantilla-requerimiento.md`](references/plantilla-requerimiento.md) |
| **Validación** | Quien pide (o producto) confirma que el enunciado es el problema real. Si no pasa, el REQ se queda en `Recibido` con el hallazgo escrito | la misma |
| **Viabilidad** | Cada área impactada dice si lo entiende, si es viable y qué le toca. Las respuestas se incorporan al REQ, no se quedan en un hilo | la misma |
| **PRD** | Producto destila los REQ en comportamiento, con reparto entre áreas y criterios de aceptación | [`plantilla-prd.md`](references/plantilla-prd.md) |
| **Tarea** | Se parte el PRD en entregas verticales observables | [`plantilla-tarea.md`](references/plantilla-tarea.md) |
| **Spec** | Cada área especifica lo suyo; se acuerdan los contratos compartidos **antes** de las tareas técnicas. Al abrirla, crea su [reporte](references/reporte-del-area.md) | `documentar-decisiones` |
| **Construcción** | Cada área implementa; la verificación rastrea hasta la tarea y el PRD. El avance se deriva | [`reporte-del-area.md`](references/reporte-del-area.md) |
| **Prueba de usuario** | Producto prueba como lo haría el usuario y valida la tarea. Un rechazo reabre el cambio del área, no toca su avance | [`plantilla-tarea.md`](references/plantilla-tarea.md) |
| **Cierre** | Cada área archiva su cambio (cierra la tarea); producto cierra el REQ cuando todas sus tareas están entregadas | [`flujo-y-duenos.md`](references/flujo-y-duenos.md) |

En la versión ligera se omiten PRD y tarea: el REQ pasa de `Aceptado` directo a la spec.

## Cuando el pedido cambia

Pasa siempre, y el coste depende de dónde esté el cambio. La tabla de qué se hace en cada
caso está en [`references/cuando-cambia-el-pedido.md`](references/cuando-cambia-el-pedido.md).
La regla general: lo que ya estaba firmado no se reescribe en silencio, se versiona. Un PRD
`Final` admite una enmienda **acotada** (versión menor en el mismo archivo) o una **mayor**
(archivo nuevo); la tabla dice cuál es cuál.

## En un proyecto con carpetas ya existentes

No renombres lo que el proyecto ya tiene. Si ya hay `docs/requisitos/` o `docs/prd/`,
úsalas: escribe en la cabecera del registro qué carpeta corresponde a cada etapa y ajusta
los enlaces de las plantillas. Si ya hay un sistema de tickets, el REQ puede enlazarlo,
pero no lo sustituye: el REQ guarda el razonamiento que un ticket no conserva.

## Comprobar a mano

No hay validador en esta librería. Al cerrar un cambio que mueve un artefacto, revisa:

1. Todo archivo `REQ-*` tiene fila en el registro, y viceversa.
2. Cada PRD o spec que cita una fila existe, y el PRD cita de vuelta al REQ.
3. El estado de la fila coincide con el del frontmatter del REQ.
4. Un REQ en `En PRD` o posterior tiene PRD; uno `Entregado` no tiene tareas sin entregar
   ni specs pendientes.
5. El «próximo número libre» del registro cuadra con las filas.
6. Con tareas: la tarea no lleva campos del área; cada cambio de spec declara la tarea que
   construye; una tarea entregada ya no está en «activas».

## Referencias

- [`references/flujo-y-duenos.md`](references/flujo-y-duenos.md): etapas, estados y gates.
- [`references/cuando-cambia-el-pedido.md`](references/cuando-cambia-el-pedido.md): qué hacer según dónde caiga el cambio.
- [`references/precedencia-entre-fuentes.md`](references/precedencia-entre-fuentes.md): quién gana cuando dos documentos chocan.
- [`references/plantilla-requerimiento.md`](references/plantilla-requerimiento.md)
- [`references/plantilla-prd.md`](references/plantilla-prd.md)
- [`references/plantilla-tarea.md`](references/plantilla-tarea.md)
- [`references/registro-de-trazabilidad.md`](references/registro-de-trazabilidad.md)
- [`references/reporte-del-area.md`](references/reporte-del-area.md): qué reporta el área sobre una tarea, cómo se deriva el avance y qué pasa cuando un cambio afecta a otra área.
- [`references/variante-con-firmas.md`](references/variante-con-firmas.md): firma nominal, quién firma por producto, frontera entre lados y niveles de evidencia.
- [`references/cuellos-de-botella.md`](references/cuellos-de-botella.md): dónde se atascó el diseño de origen al auditarlo y cómo auditar el tuyo.
