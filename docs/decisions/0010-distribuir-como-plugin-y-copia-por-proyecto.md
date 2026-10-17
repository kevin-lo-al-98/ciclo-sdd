---
status: accepted
date: 2026-10-16
decision-makers: Kevin Lopez Alvarez
---

# Distribuir el repositorio como plugin de Claude Code, con copia por proyecto como alternativa

## Context and Problem Statement

Hasta ahora había dos vías para usar el contenido: enlazar `skills/`, `commands/` y
`agents/` en `~/.claude` con `scripts/install.*`, o servir las skills por el MCP local
([ADR 0004](0004-servir-las-skills-por-mcp.md)). Las dos están pensadas para una persona
en su máquina:

* los enlaces apuntan a un clon local, y nada dice qué versión tiene instalada cada
  miembro de un equipo;
* el MCP solo sirve skills: los comandos `/sdd-*` y los agentes de `/ship` no llegan por
  esa vía ([ADR 0007](0007-agregar-commands-como-tipo-de-contenido-nuevo.md),
  [ADR 0009](0009-agregar-agents-como-tipo-de-contenido.md));
* ningún proyecto puede fijar el contenido para todo su equipo.

¿Cómo llega el ciclo de vida completo a un equipo, con la misma versión para todos?

## Decision Drivers

* Que las tres piezas (skills, comandos y agentes) lleguen juntas
* Una versión explícita y compartida, con un camino de actualización
* Que un proyecto pueda declarar el contenido para todo su equipo, versionado en su
  repositorio
* No romper el flujo de quien mantiene el catálogo, que necesita ver sus ediciones al
  instante
* Funcionar también sin acceso a GitHub o sin `/plugin`

## Considered Options

* Plugin de Claude Code, con el propio repositorio como marketplace
* Copia por proyecto (`scripts/install.* -Project`) en `<proyecto>/.claude/`
* Seguir solo con los enlaces en `~/.claude`
* Worker de Cloudflare para el MCP ([spec](../specs/worker-cloudflare.md))

## Decision Outcome

Chosen option: "plugin de Claude Code" como vía principal, con la "copia por proyecto"
como alternativa, porque la estructura del repositorio ya es la de un plugin
(`skills/`, `commands/` y `agents/` en la raíz). Solo falta el manifiesto, y el plugin
es la única opción que distribuye las tres piezas con versión.

Lo que fija:

* `.claude-plugin/plugin.json` (plugin `docs-skills`) y `.claude-plugin/marketplace.json`
  (marketplace `docs-skills`, con el plugin en `source: "./"`). El repositorio público
  `kevin-lo-al-98/docs-skills` es a la vez plugin y marketplace.
* Todo cambio publicado sube `version` en `plugin.json` y anota el cambio en
  `CHANGELOG.md`. Con `version` fijado, quien instaló no recibe commits nuevos hasta que
  el número cambia.
* Un proyecto fija el plugin para su equipo con
  `claude plugin marketplace add kevin-lo-al-98/docs-skills --scope project` y
  `claude plugin install docs-skills@docs-skills --scope project`, y versiona el
  `.claude/settings.json` resultante.
* La copia por proyecto copia (nunca enlaza) a `<proyecto>/.claude/` y deja
  `.claude/docs-skills.version` con la versión y el commit de origen.
* Los enlaces en `~/.claude` se quedan para quien mantiene el catálogo.
* El Worker se difiere: el plugin cubre Claude Code, y el Worker solo serviría a otros
  clientes MCP. El MCP local se mantiene.
* Complementa al ADR 0004, no lo sustituye.

### Consequences

* Good, because skills, comandos y agentes llegan juntos y con versión
* Good, because un equipo comparte versión a través de su propio `.claude/settings.json`
* Bad, because como plugin todo queda con espacio de nombres: `/docs-skills:sdd-new`,
  `docs-skills:documentar-decisiones`, `docs-skills:code-reviewer`. La documentación tiene
  que dar las dos formas
* Bad, because instalar a la vez el plugin y los enlaces de `~/.claude` duplica cada skill:
  hay que elegir una vía por máquina
* Bad, because el `CLAUDE.md` de la raíz del repositorio queda dentro del plugin.
  `claude plugin validate` lo marca como aviso y no lo carga, que es lo correcto: es una
  guía para quien mantiene el repositorio, no para quien lo adopta
* Bad, because publicar exige un paso más (subir `version` y anotar en `CHANGELOG.md`), y
  olvidarlo deja a los usuarios en la versión anterior sin ningún error

### Confirmation

`claude plugin validate .` pasa sin errores. En otra carpeta, `claude plugin marketplace add`
y `claude plugin install` instalan el plugin, y una sesión nueva lista los comandos
`/docs-skills:sdd-*`.

## Pros and Cons of the Options

### Copia por proyecto

* Good, because no necesita red, ni GitHub, ni `/plugin`
* Good, because sin espacio de nombres: `/sdd-new` se llama igual que en `~/.claude`
* Bad, because cada proyecto queda con su copia y hay que actualizarla a mano; por eso
  deja el archivo de versión

### Seguir solo con los enlaces en `~/.claude`

* Good, because ya funciona
* Bad, because no hay versión compartida ni forma de fijarla por proyecto

### Worker de Cloudflare

* Good, because serviría a cualquier cliente MCP sin clonar el repositorio
* Bad, because sigue sin servir comandos ni agentes, y exige migrar el SDK y montar
  autenticación
