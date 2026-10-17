---
status: accepted
date: 2026-10-17
decision-makers: Kevin Lopez Alvarez
---

# Permitir scripts de verificación sin dependencias fuera de `mcp/`

Sustituye al [ADR 0003](0003-solo-mcp-contiene-codigo.md).

## Context and Problem Statement

El ADR 0003 limitó el código a `mcp/` y descartó a propósito «herramientas de JavaScript
en la raíz», aunque reconocía que permitirían «scripts de validación compartidos». Desde
entonces el repositorio pasó de unas pocas skills a 29, más comandos y agentes, y la
única verificación es manual: instalar la skill y comprobar en una sesión nueva que se
activa. Esa prueba no escala y, además, engaña: la activación de una skill es
estocástica, así que una sola sesión no demuestra que la `description` funcione.

Dos errores frecuentes no los detecta nadie hasta que alguien usa la skill:

* una `description` sin comillas que lleva `: ` o ` #`, que Claude Code descarta en
  silencio;
* una `description` que no contiene las palabras que dice el usuario, o que se solapa
  con otra skill y le quita el turno.

`addyosmani/agent-skills` resolvió esto con scripts de Node sin dependencias: un lint
estructural y un ranking léxico de disparadores que corren en CI, y `claude plugin eval`
para medir el comportamiento real. Hay que decidir si el repositorio admite ese tipo de
código fuera de `mcp/`.

## Decision Drivers

* Un error en una skill se propaga en silencio: sin un check automático, la regla
  documentada en `CLAUDE.md` (comillas, una sola línea, exclusiones) depende de la memoria
* El repositorio no debe ganar un build, un `package.json` ni dependencias que mantener
* Las comprobaciones deben interpretar el frontmatter igual que el servidor MCP
* Lo que corre en CI tiene que ser determinista y gratuito

## Considered Options

* Scripts en `scripts/` y casos en `evals/`, solo con módulos nativos de Node y sin manifiesto
* Los validadores dentro de `mcp/`, como `npm test` del servidor
* Seguir con la verificación manual

## Decision Outcome

Chosen option: "scripts con módulos nativos de Node, sin manifiesto", because da lint
y ruteo automáticos y en CI sin añadir dependencias ni build, y mantiene la parte del
ADR 0003 que importaba: no hay `package.json` fuera de `mcp/`.

Alcance de la excepción:

* `scripts/*.mjs` y `scripts/lib/*.mjs` solo importan módulos `node:*` y
  `mcp/src/skills.js`, que es ESM puro y tampoco tiene dependencias. Reutilizarlo hace
  que el lint lea el frontmatter igual que el servidor.
* `evals/` contiene datos (JSON y Markdown), no código.
* `.github/workflows/` corre los niveles deterministas. `claude plugin eval` gasta tokens
  y nunca corre en CI.

### Consequences

* Good, because el CI comprueba en cada push las reglas del frontmatter que antes solo
  estaban escritas
* Good, because una `description` que pierde vocabulario o se solapa con otra rompe el CI
  en lugar de dejar la skill muerta sin que nadie lo vea
* Good, because el servidor MCP y el lint comparten el parser, así que no pueden
  discrepar
* Bad, because el repositorio tiene ahora código fuera de `mcp/`, y cada skill nueva
  necesita su `evals/cases/<skill>.json`
* Bad, because el ranking léxico es una aproximación: no entiende semántica, y un piso
  de rank-1 demasiado alto puede forzar descriptions artificiales

### Confirmation

En la revisión se comprueba que no aparezca un `package.json` ni otro manifiesto de
dependencias fuera de `mcp/`, y que ningún archivo de `scripts/` importe un paquete que
no sea `node:*` ni un módulo relativo del propio repositorio.

## Pros and Cons of the Options

### Los validadores dentro de `mcp/`

* Good, because respeta el ADR 0003 tal como está
* Bad, because mete en el servidor la validación de `commands/` y `agents/`, que el
  servidor no sirve, y ata la verificación del contenido al ciclo de vida del servidor

### Seguir con la verificación manual

* Good, because no añade nada
* Bad, because no detecta una `description` descartada en silencio ni un solape entre
  skills, y una sola sesión de prueba no es evidencia porque la activación es estocástica
