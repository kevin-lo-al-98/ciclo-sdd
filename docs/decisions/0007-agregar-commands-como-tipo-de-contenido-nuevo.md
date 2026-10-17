---
status: accepted
date: 2026-10-16
decision-makers: Kevin Lopez Alvarez
---

# Agregar `commands/` como segundo tipo de contenido, y generalizar el ciclo de vida SDD en un único set sin duplicar por área

## Context and Problem Statement

El repositorio de origen de la metodología SDD que motivó este catálogo (un proyecto
externo ya terminado) implementaba su ciclo de vida —`explore → new → apply → verify →
continue → archive`— como seis comandos de barra bajo `.claude/commands/`, duplicados
palabra por palabra entre `front-sdd-*` y `back-sdd-*`: la única diferencia real entre
ambos pares era el nombre del repo de código citado y la lista de skills del pie, nada del
procedimiento. Hasta ahora este repositorio solo distribuye un tipo de contenido
(`skills/`, cargado por disparador de `description` o invocado por nombre). El ciclo de
vida SDD, en cambio, es un flujo con fases ordenadas y un argumento posicional (el nombre
del cambio) — más parecido a una orden explícita que a algo que deba dispararse solo.

## Decision Drivers

* El ciclo de vida SDD no depende de si el área es front, back, o ninguna de las dos: es
  el mismo procedimiento con el mismo argumento
* Un comando con fases ordenadas y argumento posicional se ajusta mejor al modelo de
  comando de barra de Claude Code (`$ARGUMENTS`, invocación explícita) que al de skill
  (carga por disparador de `description`)
* El repositorio debe seguir sirviendo cualquier proyecto, no uno con front y back
  separados
* No debe haber dos copias del mismo procedimiento que puedan divergir

## Considered Options

* Agregar `commands/` como tipo de contenido nuevo, con un único set `sdd-*` sin
  distinción de área
* Portar el ciclo de vida como una skill (`ciclo-de-vida-sdd`) en vez de como comandos
* Mantener la duplicación por área, solo traduciendo y generalizando el contenido interno
  de cada mitad

## Decision Outcome

Chosen option: "agregar `commands/` como tipo de contenido nuevo, con un único set
`sdd-*`", porque el argumento posicional y la invocación explícita por fase encajan mejor
en el modelo de comando que en el de skill, y porque nada en el procedimiento depende del
área — duplicarlo nunca fue necesario, era un artefacto de cómo estaba organizado el
proyecto de origen (equipos de front y back separados).

Las convenciones que fija:

* `commands/<nombre>.md` — un comando por archivo. Frontmatter con `description` y, si el
  comando toma un argumento, `argument-hint`. No lleva `name`: ese campo es de skill, no
  de comando de Claude Code.
* `scripts/install.ps1` y `scripts/install.sh` enlazan `commands/*.md` a
  `~/.claude/commands`, con el mismo mecanismo de symlink-o-copia que ya usan para
  `skills/*`.
* El servidor MCP (`mcp/`) sigue sirviendo solo skills: un comando de barra es una
  convención de Claude Code que el protocolo MCP no representa. `commands/` se distribuye
  únicamente por el enlazado de los scripts.
* Los comandos `sdd-*` no citan ningún MCP, área, ni convención propia de un proyecto
  particular: todo lo que no es parte del núcleo SDD (vocabulario de dominio, firmas
  nominales, backlog externo) queda como gancho opcional, nunca como paso obligatorio.

### Consequences

* Good, because un solo lugar define el procedimiento SDD; ya no hay dos copias que
  puedan quedar desincronizadas
* Good, because el mismo set de comandos sirve a un proyecto con una sola área, con
  varias, o sin ninguna distinción de área
* Good, because `$ARGUMENTS` y la invocación explícita por fase quedan en el tipo de
  contenido pensado para eso, en vez de forzarlos dentro de una skill
* Bad, because ahora hay dos tipos de contenido que mantener (skills y comandos), con dos
  formatos de frontmatter distintos que hay que recordar no mezclar
* Bad, because los comandos no se sirven por el servidor MCP: un proyecto que solo
  consume por MCP (sin instalar por symlink) no tiene acceso al ciclo de vida SDD

## Pros and Cons of the Options

### Portar el ciclo de vida como una skill

* Good, because no agrega un tipo de contenido nuevo al repositorio
* Good, because queda servible por el MCP, igual que el resto del catálogo
* Bad, because una skill se carga por disparador de `description`, no por invocación
  explícita con argumento posicional — el modelo no calza con "ejecutá la fase `apply`
  del cambio `<nombre>`"
* Bad, because las fases de un ciclo de vida (pausar antes de `apply`, bloquear `archive`
  si `verify` dio `FAIL`) se expresan peor como contenido que se "dispara solo" que como
  una orden explícita que el usuario decide cuándo correr

### Mantener la duplicación por área

* Good, because es el cambio más chico: alcanza con traducir y generalizar el contenido
  interno de `front-sdd-*` y `back-sdd-*` sin tocar la organización en archivos
* Bad, because perpetúa dos copias de un procedimiento idéntico, que es exactamente el
  problema que esta decisión busca resolver
* Bad, because un proyecto sin áreas separadas (la mayoría de los casos de "cualquier
  proyecto") tendría que elegir arbitrariamente entre `front-sdd-*` y `back-sdd-*`, o
  ambas

## More Information

Si en el futuro hace falta servir los comandos por un canal que no sea el symlink a
`~/.claude/commands` (por ejemplo, si Claude Code o el protocolo MCP agregan una forma de
representar comandos), revisar esta decisión.
