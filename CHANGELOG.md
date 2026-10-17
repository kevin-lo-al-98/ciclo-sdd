# Changelog

Cada versión publicada del plugin `docs-skills`. La versión vive en
[`.claude-plugin/plugin.json`](.claude-plugin/plugin.json); quien instaló el plugin no
recibe un cambio hasta que ese número sube
([ADR 0010](docs/decisions/0010-distribuir-como-plugin-y-copia-por-proyecto.md)).

## 0.1.0 — 2026-10-16

Primera versión distribuida como plugin.

- Plugin y marketplace en `.claude-plugin/`.
- Copia por proyecto: `scripts/install.ps1 -Project <ruta>` y
  `scripts/install.sh --project <ruta>`.
- Roles y dueño en el ciclo SDD, con modos `solo`, `pareja` y `equipo`
  ([ADR 0011](docs/decisions/0011-roles-y-dueno-en-el-ciclo-sdd.md)).
- Reglas para trabajo concurrente en `/sdd-new` y `gestionar-roadmap`.
- Guía de qué usar según el tamaño del equipo, en el `README.md`.
- Worker de Cloudflare diferido.
