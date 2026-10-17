---
status: accepted
date: 2026-10-17
decision-makers: Kevin Lopez Alvarez
---

# Renombrar el plugin de `docs-skills` a `ciclo-sdd`

Cambia el nombre que fija el [ADR 0010](0010-distribuir-como-plugin-y-copia-por-proyecto.md);
el resto de ese ADR sigue vigente.

## Context and Problem Statement

El nombre `docs-skills` quedó de la primera versión del repositorio, cuando era un
conjunto de skills para documentar decisiones. Desde el
[ADR 0008](0008-el-ciclo-de-vida-es-el-eje-del-repositorio.md) el eje es el ciclo de vida
requerimiento → PRD → tarea → spec → código, y las skills son su complemento. Además del
catálogo de skills, el repositorio trae comandos `/sdd-*`, agentes y un servidor MCP.

El nombre actual induce a error en dos sentidos: «docs» sugiere un generador de
documentación y «skills» reduce el repositorio a su parte complementaria. Como el nombre
es el prefijo de todo lo que expone el plugin (`/docs-skills:sdd-new`) y el identificador
que los proyectos adoptantes fijan en su `.claude/settings.json`, cuanto más tarde se
cambie, más proyectos habrá que actualizar.

## Decision Drivers

* El nombre debe describir el eje del repositorio, no una de sus partes
* Se usa como prefijo e identificador: tiene que ser corto
* Política de idioma del repositorio ([ADR 0001](0001-contenido-de-las-skills-en-espanol.md))
* Pocos proyectos lo han adoptado todavía, así que el coste de migrar es mínimo hoy

## Considered Options

* `ciclo-sdd`
* `del-pedido-al-codigo`
* `cadena-sdd`
* `trazo`
* `sdd-kit`
* Mantener `docs-skills`

## Decision Outcome

Chosen option: "`ciclo-sdd`", because nombra el eje definido en el ADR 0008, está en
español y es lo bastante corto para usarse como prefijo (`/ciclo-sdd:sdd-new`) e
identificador (`ciclo-sdd@ciclo-sdd`). La sigla no es una barrera real: los comandos ya se
llaman `/sdd-*`.

El cambio alcanza al plugin, al marketplace, al servidor MCP (`ciclo-sdd-mcp`), al
archivo `.claude/ciclo-sdd.version` de la copia por proyecto y a la URL del repositorio
(`kevin-lo-al-98/ciclo-sdd`). Los ADR anteriores conservan el nombre viejo: son historia.

### Consequences

* Good, because el nombre coincide con lo que el README y el ADR 0008 dicen que es el
  repositorio
* Good, because se cambia con pocos adoptantes
* Bad, because es un cambio incompatible (versión `0.2.0`): quien tenga
  `docs-skills@docs-skills` en `.claude/settings.json` deja de recibir actualizaciones
  hasta migrar
* Bad, because los comandos pasan de `/docs-skills:*` a `/ciclo-sdd:*`, y las copias por
  proyecto tienen un `.claude/docs-skills.version` que ya no se actualiza

### Migración en un proyecto adoptante

```
claude plugin uninstall docs-skills@docs-skills
claude plugin marketplace add kevin-lo-al-98/ciclo-sdd --scope project
claude plugin install ciclo-sdd@ciclo-sdd --scope project
```

Con copia por proyecto: volver a ejecutar `scripts/install.sh --project <ruta>` y borrar
`.claude/docs-skills.version`. Con MCP: `claude mcp remove docs-skills` y
`claude mcp add ciclo-sdd -- node <ruta>/mcp/src/stdio.js`.
