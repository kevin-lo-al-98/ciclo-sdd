---
status: accepted
date: 2026-10-16
decision-makers: Kevin Lopez Alvarez
---

# Agregar `agents/` como tercer tipo de contenido, para los subagentes de los que depende `/ship`

## Context and Problem Statement

Se vendorizaron de addyosmani/agent-skills (MIT) las skills de test, review y ship, y
después sus comandos `/test`, `/review` y `/ship`. `/ship` lanza en paralelo tres
subagentes de Claude Code —`code-reviewer`, `security-auditor` y `test-engineer`— por
`subagent_type`, y fusiona sus informes en una decisión GO / NO-GO. Sin esos subagentes
instalados en `~/.claude/agents`, el comando no funciona. Hasta ahora el repositorio solo
distribuía skills y comandos ([ADR 0007](0007-agregar-commands-como-tipo-de-contenido-nuevo.md)).

## Decision Drivers

* `/ship` debe funcionar tal como se trae, sin que el usuario monte nada a mano
* Un subagente tiene su propio formato (`name`, `description`, cuerpo como system prompt)
  y su propio directorio en Claude Code; no es una skill ni un comando
* El material de terceros se conserva sin reescribir
  ([ADR 0002](0002-skills-vendorizadas-en-su-idioma-original.md))

## Considered Options

* Agregar `agents/` como tipo de contenido, enlazado por los scripts a `~/.claude/agents`
* Reescribir `/ship` para que ejecute las tres revisiones en secuencia en la sesión
  principal, sin subagentes
* No traer `/ship`

## Decision Outcome

Chosen option: "agregar `agents/` como tipo de contenido", porque es la única que deja
`/ship` funcionando sin reescribirlo y conserva la ejecución en paralelo, que es su razón
de ser.

Lo que fija:

* `agents/<nombre>.md` — un subagente por archivo, con el frontmatter de subagente de
  Claude Code (`name`, `description`).
* `scripts/install.ps1` (parámetro `-Agent`) y `scripts/install.sh` enlazan `agents/*.md`
  a `~/.claude/agents`, con el mismo mecanismo de symlink-o-copia que los comandos.
* El servidor MCP no sirve agentes, igual que no sirve comandos: son convenciones de
  Claude Code que el protocolo no representa.
* Un agente definido por el usuario en `~/.claude/agents` o `.claude/agents` con el mismo
  nombre lo reemplaza; es comportamiento de Claude Code, no de este repositorio.

### Consequences

* Good, because `/ship` funciona con la instalación estándar
* Good, because los subagentes quedan disponibles también para invocarlos directamente
* Bad, because ya hay tres tipos de contenido con tres formatos de frontmatter distintos
* Bad, because un proyecto que solo consume por MCP no tiene ni comandos ni agentes

## Pros and Cons of the Options

### Reescribir `/ship` en secuencia

* Good, because no agrega un tipo de contenido
* Bad, because es reescribir material vendorizado, y se pierde el paralelismo y el
  aislamiento de contexto entre revisores, que es lo que el comando busca

### No traer `/ship`

* Good, because no hay nada nuevo que mantener
* Bad, because la skill `shipping-and-launch` se queda sin su orquestador
