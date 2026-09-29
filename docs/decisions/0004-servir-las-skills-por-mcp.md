---
status: accepted
date: 2026-09-28
decision-makers: Kevin Lopez Alvarez
---

# Servir las skills por MCP además de instalarlas

## Context and Problem Statement

La forma de usar las skills era enlazar `skills/*` en `~/.claude/skills` con
`scripts/install.ps1` o `scripts/install.sh`. Eso exige clonar el repositorio en cada
máquina, en Windows exige el Modo de desarrollador para los enlaces simbólicos, y solo
lo aprovechan los clientes que leen esa carpeta. Hace falta otra vía para consumir las
mismas skills.

Esta decisión se registró a posteriori: el servidor ya estaba implementado. Su
documentación está en [`mcp/README.md`](../../mcp/README.md).

## Decision Drivers

* Poder usar las skills desde clientes que no leen `~/.claude/skills`
* No depender de los enlaces simbólicos de Windows
* Poder buscar entre las skills en lugar de conocerlas de antemano
* No cargar todo el contenido en el contexto: el repositorio ya separa `SKILL.md` de
  `references/` justo para evitarlo

## Considered Options

* Solo instalar con los scripts, sin servidor
* Servidor MCP local por stdio, además de los scripts
* Servidor MCP remoto en un Worker de Cloudflare

## Decision Outcome

Chosen option: "servidor MCP local por stdio, además de los scripts", because cubre los
tres primeros factores sin exigir infraestructura remota. Las tres tools reparten el
trabajo a propósito: `listar_skills` y `buscar_skills` dicen dónde mirar y `leer_skill`
trae el contenido, de modo que consultar no llena el contexto con material que no se
va a usar.

La variante remota sigue como propuesta, sin implementar:
[`docs/specs/worker-cloudflare.md`](../specs/worker-cloudflare.md). El código está
separado para que pueda viajar: `skills.js` y `servidor.js` no dependen del disco, y
solo `cargar-disco.js` lo hace.

### Consequences

* Good, because las skills se consumen sin instalarlas en `~/.claude/skills`
* Good, because el modelo puede buscar entre ellas
* Bad, because **por MCP las skills no se activan solas**: Claude Code carga por
  `description` únicamente las instaladas, y por MCP el modelo tiene que llamar a las
  tools. El proyecto que las use necesita un aviso en su `CLAUDE.md`, y de eso se ocupa
  la skill `adoptar-estructura-de-docs`
* Bad, because el servidor lee las skills al arrancar: tras editar un `SKILL.md` hay que
  reiniciarlo
* Bad, because solo carga `references/`: material en otra subcarpeta, como `assets/` en
  la especificación de skills, no llegaría al cliente
* Bad, because al ser local solo sirve en la máquina donde está el repositorio

### Confirmation

Tras cambiar una skill, se reinicia el servidor con `/mcp` y se comprueba con
`listar_skills` que aparece y con `leer_skill` que devuelve su contenido y sus
referencias.

## Pros and Cons of the Options

### Solo instalar con los scripts

* Good, because Claude Code activa cada skill por su `description`, sin depender de que
  el modelo llame a una tool
* Bad, because exige el repositorio clonado y, en Windows, el Modo de desarrollador
* Bad, because no sirve a clientes que no leen `~/.claude/skills`

### Servidor MCP remoto en Cloudflare

* Good, because no exigiría el repositorio clonado en el cliente
* Bad, because necesita autenticación (un MCP remoto sin ella es público) y un despliegue
  que mantener
* Neutral, because sigue disponible como evolución sin rehacer nada: es la spec pendiente
