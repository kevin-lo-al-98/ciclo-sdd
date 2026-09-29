---
status: accepted
date: 2026-09-29
decision-makers: Kevin Lopez Alvarez
---

# Usar MADR 4.0 para registrar las decisiones de este repositorio

## Context and Problem Statement

Las decisiones de este repositorio vivían como prosa dentro de `CLAUDE.md`: por qué el
contenido va en español, por qué una carpeta está en inglés, por qué solo `mcp/` tiene
código. Eso mezcla dos cosas de naturaleza distinta. `CLAUDE.md` se carga entero en cada
sesión y debe ser corto; el porqué de una decisión es material de consulta, que solo se
lee cuando se va a cuestionar la decisión. Hace falta un sitio y un formato para el
porqué.

## Decision Drivers

* `CLAUDE.md` debe seguir corto: la documentación oficial recomienda menos de 200 líneas
* El repositorio es de una sola organización y una sola persona mantiene el catálogo
* El formato debe servir también para otros proyectos, sin arrastrar una infraestructura
* Las alternativas descartadas tienen que quedar registradas, no solo la elegida

## Considered Options

* MADR 4.0
* ADR en formato Nygard
* ADR Zoom, el estándar de PACMAN que usa el proyecto PRISMA
* Seguir con las decisiones en prosa dentro de `CLAUDE.md`

## Decision Outcome

Chosen option: "MADR 4.0", because es un estándar mantenido y de un solo documento, con
una sección de alternativas y secciones opcionales que dejan escribir desde una decisión
pequeña hasta una con análisis completo, sin exigir infraestructura alrededor.

Las convenciones que fija:

* Los ADRs van en `docs/decisions/` con nombre `NNNN-titulo-con-guiones.md`, y las specs
  en `docs/specs/`.
* Las secciones y las claves del frontmatter se dejan en inglés, tal como las define
  MADR; el contenido va en español, como el resto del repositorio.
* `Confirmation` es opcional, como en MADR. Este repositorio no tiene tests y su
  verificación es manual, así que obligarla produciría confirmaciones de relleno.
* La plantilla vive en `skills/documentar-decisiones/references/plantilla-madr.md`, que es
  su única copia. Aquí no se duplica.

### Consequences

* Good, because el porqué de cada decisión queda con sus alternativas y `CLAUDE.md`
  puede reducirse a la regla y un enlace
* Good, because la misma convención se lleva a otros proyectos con la skill
  `adoptar-estructura-de-docs`
* Bad, because cada decisión relevante cuesta escribir un documento, y un ADR trivial
  entierra los importantes
* Bad, because MADR no lleva registro de decisiones ni dice en qué archivos aplica cada
  una, así que ningún agente sabe por sí solo qué ADR consultar ante una tarea

### Confirmation

Al añadir una regla a `CLAUDE.md` que responda a una decisión con alternativas, se
comprueba en la revisión que exista su ADR y que `CLAUDE.md` solo lleve el enlace.

## Pros and Cons of the Options

### ADR en formato Nygard

* Good, because es el formato más corto y conocido
* Bad, because no tiene sección de alternativas: registra qué se decidió, pero no qué se
  descartó, que es justo lo que se pierde con el tiempo

### ADR Zoom (PACMAN)

Es el estándar que usa `jenkins/common` del proyecto PRISMA: frontmatter de 14
propiedades, IDs con espacio de nombres (`ADR-INFO-PRISMA-CUMPL-013`), niveles L0 a L3 y
un registro de decisiones con `Enforcement`, `Scope` y `Trigger`.

* Good, because el registro con `Trigger` permite a un agente saber qué decisión consultar
  ante cada tarea, cosa que MADR no resuelve
* Bad, because está pensado para un catálogo compartido entre organizaciones y aquí hay
  una sola, así que los niveles y los espacios de nombres serían mantenimiento sin uso
* Bad, because es material corporativo: adoptarlo convertiría este repositorio en un
  fork de un estándar interno
* Bad, because sus skills pesan miles de líneas de referencias, frente a un `SKILL.md`
  corto con referencias enlazadas

### Decisiones en prosa dentro de `CLAUDE.md`

* Good, because no hay nada nuevo que mantener
* Bad, because `CLAUDE.md` se carga completo en cada sesión: cada porqué que se añade
  encarece todas las sesiones, incluidas las que nunca lo necesitan

## More Information

Si algún día el repositorio necesita que un agente sepa qué ADR consultar según la tarea,
lo que tiene MADR de menos está en el registro de ADR Zoom, no en su formato de
documento. Esa sería una decisión nueva, con su propio ADR.
