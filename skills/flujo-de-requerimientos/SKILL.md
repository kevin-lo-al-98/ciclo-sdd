---
name: flujo-de-requerimientos
description: EXPERIMENTAL. Monta y sigue una cadena documental de requerimiento a spec —requerimiento (REQ), PRD, tarea y spec— con un dueño por etapa, plantillas y una única tabla de trazabilidad. Úsala cuando el usuario diga "dar de alta un requerimiento", "convierte este correo o esta reunión en un requerimiento", "escribe un PRD", "qué número de REQ toca", "plantilla de requerimiento", "plantilla de PRD", "trazabilidad entre requerimiento y spec", "el pedido cambió a mitad de camino", "quién valida esto antes de especificarlo", o cuando quien pide y quien construye sean personas o áreas distintas y se esté perdiendo alcance entre el pedido y la construcción. No la uses para redactar una spec técnica ni un ADR (`documentar-decisiones`), para un equipo de una sola persona, ni para gestionar tickets o issues en Jira o GitHub.
---

# Flujo de requerimiento a spec

> **Experimental.** El diseño sale de un monorepo documental que lo definió con mucho
> detalle pero que, cuando se leyó (octubre de 2026), todavía no lo había recorrido con
> trabajo real: sus registros estaban vacíos y su propia auditoría no medía tiempos porque
> no había ninguno. Los gates y las plantillas son una hipótesis razonada, no una práctica
> probada. Adóptalo con ese descuento y recorta lo que no se justifique al usarlo.

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
| **Completa** | REQ + PRD + tarea + spec + registro | El comportamiento hay que definirlo antes de especificar, o varias áreas implementan partes |
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
| `TAREA` | ¿Cuál es la unidad de entrega observable? | Producto |
| spec | ¿Qué se construye y cómo se verifica? | Cada área que construye |

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

## Cómo se trabaja cada etapa

| Etapa | Qué haces | Plantilla |
|---|---|---|
| **Alta** | Entrevista a quien pide, escribe el REQ y añade su fila al registro en el mismo cambio | [`plantilla-requerimiento.md`](references/plantilla-requerimiento.md) |
| **Validación** | Quien pide (o producto) confirma que el enunciado es el problema real. Si no pasa, el REQ se queda en `Recibido` con el hallazgo escrito | la misma |
| **Viabilidad** | Cada área impactada dice si lo entiende, si es viable y qué le toca. Las respuestas se incorporan al REQ, no se quedan en un hilo | la misma |
| **PRD** | Producto destila los REQ en comportamiento, con reparto entre áreas y criterios de aceptación | [`plantilla-prd.md`](references/plantilla-prd.md) |
| **Tarea** | Se parte el PRD en entregas verticales observables | [`plantilla-tarea.md`](references/plantilla-tarea.md) |
| **Spec** | Cada área especifica lo suyo; se acuerdan los contratos compartidos **antes** de las tareas técnicas | `documentar-decisiones` |

En la versión ligera se omiten PRD y tarea: el REQ pasa de `Aceptado` directo a la spec.

## Cuando el pedido cambia

Pasa siempre, y el coste depende de dónde esté el cambio. La tabla de qué se hace en cada
caso está en [`references/cuando-cambia-el-pedido.md`](references/cuando-cambia-el-pedido.md).
La regla general: lo que ya estaba firmado no se reescribe en silencio, se versiona.

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
4. Un REQ en `En PRD` o posterior tiene PRD; uno `Entregado` no tiene specs pendientes.
5. El «próximo número libre» del registro cuadra con las filas.

## Referencias

- [`references/flujo-y-duenos.md`](references/flujo-y-duenos.md): etapas, estados y gates.
- [`references/cuando-cambia-el-pedido.md`](references/cuando-cambia-el-pedido.md): qué hacer según dónde caiga el cambio.
- [`references/precedencia-entre-fuentes.md`](references/precedencia-entre-fuentes.md): quién gana cuando dos documentos chocan.
- [`references/plantilla-requerimiento.md`](references/plantilla-requerimiento.md)
- [`references/plantilla-prd.md`](references/plantilla-prd.md)
- [`references/plantilla-tarea.md`](references/plantilla-tarea.md)
- [`references/registro-de-trazabilidad.md`](references/registro-de-trazabilidad.md)
- [`references/variante-con-firmas.md`](references/variante-con-firmas.md): firma nominal, frontera entre lados y niveles de evidencia.
