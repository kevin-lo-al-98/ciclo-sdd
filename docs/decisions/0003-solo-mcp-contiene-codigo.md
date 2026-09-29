---
status: accepted
date: 2026-09-28
decision-makers: Kevin Lopez Alvarez
---

# Limitar el código con dependencias a la carpeta `mcp/`

## Context and Problem Statement

El producto de este repositorio son archivos Markdown que otras sesiones de Claude Code
cargan como instrucciones. No hay aplicación, ni build, ni tests. El servidor MCP que
sirve las skills es la excepción: es código de Node con dependencias. Hay que decidir
dónde vive y hasta dónde llega esa excepción.

Esta decisión se registró a posteriori: la regla ya estaba en `CLAUDE.md` desde que se
añadió el servidor.

## Decision Drivers

* El resto del repositorio no tiene ninguna herramienta de JavaScript y no debe empezar a
  tenerla
* Un error en una skill no rompe ningún test: se propaga en silencio, así que cada pieza
  de tooling añadida es una superficie más
* El servidor y las skills que sirve deben versionarse juntos

## Considered Options

* El servidor en `mcp/`, aislado, y el resto del repositorio sin build
* El servidor en un repositorio aparte
* Herramientas de JavaScript en la raíz del repositorio

## Decision Outcome

Chosen option: "el servidor en `mcp/`, aislado", because mantiene el servidor y las
skills que sirve en el mismo historial, sin llevar un `package.json` ni un build a la
raíz.

### Consequences

* Good, because el repositorio sigue sin build fuera de `mcp/`
* Good, because un cambio en una skill y en el servidor que la sirve va en el mismo
  commit
* Bad, because el repositorio tiene ahora un `package.json` y un lockfile, y la regla
  «no metas herramientas de JavaScript fuera de esa carpeta» hay que recordarla
* Bad, because `mcp/` no es una skill y rompe la uniformidad de un repositorio hecho de
  ellas

### Confirmation

En la revisión se comprueba que no aparezca un `package.json` ni otro manifiesto de
dependencias fuera de `mcp/`.

## Pros and Cons of the Options

### El servidor en un repositorio aparte

* Good, because el repositorio de skills quedaría sin código
* Bad, because servidor y skills se versionarían por separado y pueden desincronizarse:
  el servidor lee la estructura de las skills, así que un cambio en una puede romper el
  otro

### Herramientas de JavaScript en la raíz

* Good, because permitiría scripts de validación compartidos
* Bad, because lleva un build a un repositorio que no lo necesita y mezcla código y
  contenido
