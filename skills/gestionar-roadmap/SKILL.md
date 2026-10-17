---
name: gestionar-roadmap
description: 'Crea y mantiene un único ROADMAP.md en la raíz del proyecto, el índice vivo del trabajo (en curso, pendiente y listo para arrancar, ideas a futuro), que complementa sin duplicar los cambios SDD y los PRDs. Úsala para ver qué sigue, agregar, quitar o reordenar tareas por dependencia, marcar una idea como lista, promover una tarea a un cambio SDD (delegando en `/sdd-new` o en `flujo-de-requerimientos`), limpiar cambios ya archivados, auditar el roadmap contra `openspec/changes/` o inicializarlo en un proyecto que no lo tiene. Frases como "agregá esto al roadmap", "¿qué debería hacer ahora?", "¿algo está bloqueando X?", "promové Y al roadmap", "sacá del roadmap los cambios archivados", "el roadmap está desactualizado", "refrescá el roadmap", "inicializá un roadmap" o "la lista de en curso tiene entradas viejas" la disparan. Solo escribe `ROADMAP.md`; los archivos de un cambio SDD son de los comandos `/sdd-*` y los PRDs, de `flujo-de-requerimientos`.'
---

# Gestión del roadmap

Un único `ROADMAP.md` en la raíz del proyecto que responde dos preguntas:

1. **"¿Qué puedo arrancar ahora?"** — la próxima tarea pendiente siempre tiene que ser
   arrancable (sin dependencia sin cumplir).
2. **"¿Qué está bloqueando eso?"** — las entradas en curso existen solo para que las tareas
   pendientes que dependen de ellas sepan qué están esperando.

Todo lo demás (criterios de aceptación, diseño, tareas, código) vive en la carpeta del
cambio SDD o en el archivo de PRD al que apunta la entrada del roadmap. El roadmap es un
**índice**, no una copia.

## Principio central: complementar, no duplicar

El roadmap es una capa de coordinación delgada encima de los cambios SDD y los PRDs.
**Nunca** es la fuente de verdad de la spec, el diseño o el plan de implementación de una
tarea — eso vive en sus propios archivos. Lo único que el roadmap posee es:

- **Orden** — qué va después de qué.
- **Relaciones de bloqueo** — qué tareas pendientes dependen de cuáles tareas en curso.
- **Ideas pre-formales** — entradas a futuro que todavía no justifican un PRD.

Si un dato ya vive en `openspec/changes/<cambio>/proposal.md`, en un archivo de PRD, o en
`docs/`, el roadmap **enlaza** ahí. No lo copia. Volver a correr esta skill sobre el mismo
proyecto produce el mismo roadmap, no una pila creciente de resúmenes desactualizados.

## Cuándo aplicar esta skill

Disparala ante cualquiera de estos casos:

| Modo | Cuándo | Qué hace esta skill |
|---|---|---|
| **Inicializar** | El proyecto no tiene `ROADMAP.md` todavía. | Crea el archivo. Puebla **En curso** desde los cambios activos en `openspec/changes/` (excluyendo `archive/`). Pide al usuario que confirme las entradas pendientes/futuras. |
| **Agregar tarea** | El usuario tiene una tarea nueva para registrar. | Pregunta en qué sección (En curso / Pendiente / Futuro), captura el mínimo de metadatos de esa sección, la ubica en orden de dependencia. |
| **Promover** | Una idea Futura está lista para pasar a Pendiente, o una tarea Pendiente está lista para arrancar. | Para Futuro → Pendiente, sugiere delegar en `flujo-de-requerimientos` si se quiere un PRD. Para Pendiente → En curso, delega en `/sdd-new`. La entrada del roadmap se mueve solo cuando el artefacto subyacente (PRD / cambio SDD) ya existe. |
| **Reorganizar** | Cambiaron las dependencias o el usuario quiere reordenar. | Reordena la lista Pendiente para que el primer ítem siempre sea arrancable. Marca ciclos. Señala tareas que quedarían bloqueadas para siempre. |
| **Limpiar** | Un cambio SDD se acaba de archivar, o el usuario nota entradas desactualizadas. | Elimina las entradas En curso cuyo cambio ya está bajo `openspec/changes/archive/`. Promueve a la posición 1 cualquier entrada Pendiente recién desbloqueada. |
| **Auditar/refrescar** | El usuario dice "el roadmap está desactualizado". | Recorre `openspec/changes/` (activos + archivados), compara con `ROADMAP.md`, reporta la deriva, propone ediciones antes de escribir. Nunca reescribe en silencio. |

## Ubicación y forma del archivo

`ROADMAP.md` siempre vive en la **raíz del proyecto**. Uno por proyecto. Nunca se separa ni
se anida.

El archivo tiene exactamente tres secciones de nivel superior, siempre en este orden:

```markdown
# Roadmap

> Índice vivo del trabajo. Ver los cambios SDD y PRDs enlazados para el detalle.

## En curso

<!-- Cambios SDD activos. Se listan solo para bloquear tareas Pendientes dependientes.
     Quitar la entrada cuando su cambio SDD se archive. -->

### <nombre-del-cambio>
- **Estado**: <una línea corta — p. ej. "spec lista, implementación en curso">
- **SDD**: `openspec/changes/<nombre-del-cambio>/`
- **Bloquea**: `<tarea-pendiente>`, `<tarea-pendiente>` <!-- omitir si no bloquea nada -->

## Pendiente

<!-- Ordenada. El primer ítem TIENE que ser arrancable (sin dependencia sin cumplir).
     Usar una lista numerada para que el orden sea explícito. -->

### 1. <nombre-de-tarea>
- **Tipo**: SDD | no-SDD
- **PRD**: `docs/prds/<nombre-de-tarea>.md` <!-- omitir si todavía no hay PRD -->
- **Depende de**: <nombres de cambios en curso> <!-- "—" si no depende de nada -->
- **Próximo paso**: <acción — p. ej. "Correr /sdd-new <nombre-de-tarea>" o "Abrir PR con el fix">
- **Notas**: <contexto de una línea, opcional>

### 2. <nombre-de-tarea>
- ...

## Futuro

<!-- Ideas capturadas para después. Sin PRD ni definición formal todavía.
     Promover a Pendiente cuando estén listas para especificarse. -->

- **<tema>** — <una o dos líneas de descripción>.
  Nombre SDD sugerido: `<sugerencia-en-kebab-case>` <!-- opcional -->
- **<tema>** — ...
```

Cualquier otra cosa (criterios de aceptación por tarea, notas de diseño, listas de
subtareas, detalle técnico) **no** va en el roadmap. Eso va al cambio SDD, al PRD, o a
`docs/`.

### Semántica de las secciones — qué va dónde

| Sección | Entradas que acepta | Entradas que rechaza |
|---|---|---|
| **En curso** | Cambios SDD que existen bajo `openspec/changes/<nombre>/` y no están archivados. | Tareas no-SDD (esas van directo a Pendiente y desaparecen cuando terminan). Tareas cuyo SDD ya se archivó (hay que quitarlas, no mantenerlas). |
| **Pendiente** | Próximas tareas concretas. Pueden ser SDD (PRD opcional) o no-SDD (sin necesidad de envoltorio SDD). | Ideas vagas sin un próximo paso claro — esas van a Futuro. Tareas que dependen de algo que no está En curso (falta la dependencia — corregilo antes de listarla). |
| **Futuro** | Ideas pre-formales. Puede incluir un nombre SDD sugerido pero sin PRD, sin spec, sin diseño. | Tareas listas para arrancar ya — promovelas a Pendiente. Tareas ya en marcha — pertenecen a En curso. |

El **invariante de arrancabilidad** no es negociable: la primera entrada Pendiente tiene
que tener el campo `Depende de:` vacío. Si reordenar produce una lista Pendiente cuyo primer
ítem está bloqueado, la skill tiene que reordenar o señalar que el roadmap está
desabastecido.

## Operaciones — elegí el flujo correcto

Cada operación comparte el mismo esqueleto: **leer el estado actual → proponer ediciones →
confirmar con el usuario → escribir el archivo**. El paso a paso completo de cada una está
en [`references/operations.md`](references/operations.md) — leelo cuando lo necesites, no
lo precargues.

| Operación | Cuándo | Referencia |
|---|---|---|
| **Inicializar** | `ROADMAP.md` todavía no existe. | [`operations.md#inicializar`](references/operations.md#inicializar) |
| **Agregar tarea** | El usuario registra una tarea nueva. | [`operations.md#agregar-tarea`](references/operations.md#agregar-tarea) |
| **Promover** | Futuro → Pendiente, o Pendiente → En curso (típicamente vía `/sdd-new`). | [`operations.md#promover`](references/operations.md#promover) |
| **Reorganizar** | Cambiaron prioridades o dependencias. | [`operations.md#reorganizar`](references/operations.md#reorganizar) |
| **Limpiar** | Después de `/sdd-archive`, o al notar entradas desactualizadas. | [`operations.md#limpiar`](references/operations.md#limpiar) |
| **Auditar/refrescar** | El roadmap y `openspec/changes/` pueden haberse desincronizado. | [`operations.md#auditar--refrescar`](references/operations.md#auditar--refrescar) |

Toda operación tiene que cumplir las **reglas de validación** de
[`operations.md#validacion--tiene-que-cumplirse-despues-de-cada-escritura`](references/operations.md#validacion--tiene-que-cumplirse-despues-de-cada-escritura)
antes de escribir. Resumen corto:

1. La primera entrada Pendiente tiene que ser arrancable (`Depende de:` vacío).
2. Todo enlace `SDD:` resuelve a un cambio real (carpeta existente).
3. Todo `Depende de:` en Pendiente apunta a una entrada En curso existente — nunca a otra
   entrada Pendiente.
4. Las entradas Futuro no llevan dependencias.
5. Ningún nombre de cambio se repite entre secciones.
6. La lista Pendiente está renumerada de forma contigua.

Si alguna regla falla, no escribas el archivo — señalá la falla y proponé el arreglo más
chico.

## Reglas de delegación

Esta skill escribe **solo** `ROADMAP.md`. Para cualquier otro artefacto, delegá en la skill
correspondiente — no dupliques su trabajo inline.

| El usuario quiere… | Delegar en | El rol de esta skill |
|---|---|---|
| Arrancar un cambio SDD nuevo desde una entrada Pendiente | `/sdd-new <nombre>` | Una vez que SDD termina, mover la entrada de Pendiente a En curso y renumerar. |
| Crear un PRD para una entrada Futura o Pendiente | `flujo-de-requerimientos` | Agregar la ruta `PRD:` nueva a la entrada una vez que el archivo exista. |
| Descomponer un PRD existente en tareas | `flujo-de-requerimientos` | Ninguno — la entrada del roadmap ya existe. |
| Archivar un cambio SDD terminado | `/sdd-archive` | Correr *Limpiar* después, para que la entrada salga de En curso. |
| Continuar la siguiente fase de un cambio SDD | `/sdd-continue` | Actualizar la línea `Estado:` de la entrada En curso si el usuario quiere una línea nueva. |

Al delegar, mostrale al usuario el comando exacto (o invocalo como subagente en modo
orquestador) — no lo parafrasees. La edición del roadmap espera a que la skill delegada
termine; hasta entonces, el roadmap refleja el estado anterior.

## Antipatrones — señalalos de inmediato

- **El roadmap repite la propuesta SDD.** Si la entrada En curso contiene criterios de
  aceptación, notas de diseño o listas de tareas, borralos — viven en
  `openspec/changes/<nombre>/`. El roadmap solo guarda Estado + enlace SDD + Bloquea.
- **Una entrada Pendiente no tiene Próximo paso.** Entonces no está pendiente — es una idea
  Futura. Movela.
- **Una entrada Futura tiene un campo `Depende de:`.** Futuro es pre-formal. Las
  dependencias implican concreción; primero promovela a Pendiente.
- **Una entrada En curso no tiene enlace SDD.** O el cambio SDD se borró (hay que
  limpiarla) o la entrada se agregó a mano y se saltó el flujo de Promover (volvé a correr
  Promover para completarla).
- **El primer ítem de la lista Pendiente está bloqueado.** Invariante roto. Reordená o
  desbloqueá agregando la dependencia faltante a En curso.
- **Editar el roadmap en silencio dentro de otro flujo.** Las ediciones del roadmap siempre
  se muestran como un diff para que el usuario confirme. Las demás skills (SDD, PRD)
  **tienen** que señalar que el roadmap debe actualizarse en vez de editarlo ellas mismas.
- **Ciclos vía dependencias Pendiente → Pendiente.** El esquema los prohíbe. Expresá el
  orden con la posición en la lista, no con `Depende de:`.
- **Nombres de cambio duplicados entre secciones.** Una entrada está en exactamente una
  sección en cada momento. Promover / Limpiar son los únicos movimientos legales entre
  secciones.
- **Dejar que `ROADMAP.md` crezca sin límite.** Limpiar tiene que correr cuando se archivan
  cambios SDD. Las entradas En curso desactualizadas son síntoma de un Limpiar que no se
  corrió, no de trabajo legítimo.

## Qué esperar al terminar

Cuando la skill termina una operación:

- **`ROADMAP.md` refleja la edición pedida**, todas las reglas de validación de arriba se
  cumplen, y el diff se mostró al usuario antes de escribir.
- **Los artefactos enlazados existen.** Todo `SDD:` resuelve. Todo `PRD:` resuelve.
- **La semántica de las secciones se respeta.** Nada en Futuro tiene dependencia. Nada en
  Pendiente tiene un borde Pendiente→Pendiente. Nada en En curso carece de enlace SDD.
- **La lista Pendiente está numerada de forma contigua**, empezando en 1, con la posición 1
  arrancable.
- **Nada de contenido duplicado desde archivos de SDD o PRD.** Si la skill en algún momento
  se encuentra copiando párrafos de `proposal.md` a `ROADMAP.md`, perdió el rumbo — hay que
  enlazar en vez de copiar.

## Referencia rápida

| Pregunta | Respuesta |
|---|---|
| ¿Dónde vive `ROADMAP.md`? | En la raíz del proyecto. Uno por proyecto. |
| ¿Las tareas no-SDD van en el roadmap? | Sí, pero solo en Pendiente (y solo brevemente). Nunca tienen representación En curso. |
| ¿Qué entra en En curso? | Solo cambios SDD activos (la carpeta existe bajo `openspec/changes/` y el cambio no está archivado). |
| ¿Cuándo sale una entrada del roadmap? | Las de En curso salen con `/sdd-archive`. Las Pendientes no-SDD salen cuando el trabajo termina. Las Futuras salen al promoverse. |
| ¿La skill puede escribir dentro de `openspec/changes/`? | No. Solo `ROADMAP.md`. Los archivos de SDD pertenecen a los comandos `/sdd-*`. |
| ¿La skill puede escribir un PRD? | No. Los PRD pertenecen a `flujo-de-requerimientos`. La skill delega y después registra la ruta resultante. |

## Referencias de detalle — leer a demanda

No las precargues. Leé la que necesites.

| Archivo | Cuándo leerlo |
|---|---|
| [`references/operations.md`](references/operations.md) | Estás a punto de ejecutar Inicializar / Agregar tarea / Promover / Reorganizar / Limpiar / Auditar. Contiene el paso a paso completo de cada una, más las reglas de validación. |
| [`assets/example-ROADMAP.md`](assets/example-ROADMAP.md) | Querés una referencia concreta de cómo se ve un `ROADMAP.md` poblado en las tres secciones, con entradas SDD y no-SDD realistas y el cableado de dependencias. |
