# Changelog

Cada versión publicada del plugin `docs-skills`. La versión vive en
[`.claude-plugin/plugin.json`](.claude-plugin/plugin.json); quien instaló el plugin no
recibe un cambio hasta que ese número sube
([ADR 0010](docs/decisions/0010-distribuir-como-plugin-y-copia-por-proyecto.md)).

## 0.1.2 — 2026-10-17

- Verificación automática de skills en tres niveles ([`evals/README.md`](evals/README.md),
  [ADR 0012](docs/decisions/0012-scripts-de-verificacion-sin-dependencias.md), que
  sustituye al 0003):
  - lint de frontmatter, enlaces, comandos, agentes y versión (`scripts/validar.mjs`);
  - ruteo de disparadores con casos para las 29 skills (`scripts/evaluar-disparadores.mjs`);
  - casos de `claude plugin eval` para `documentar-decisiones`,
    `flujo-de-requerimientos`, `revisar-mr` y `escribir-mensaje-de-commit`.
  Los dos primeros corren en CI.
- `plugin.json` declara `experimental.evals: evals/plugin`.
- `entrevistar-con-contexto`: los enlaces a `CONTEXT-FORMAT.md` y `ADR-FORMAT.md`
  apuntaban fuera de `references/` y estaban rotos.
- `revisar-mr`: la exclusión de la `description` pasa a «No la uses para la calidad del
  código en sí…». Antes, «revisa la calidad del código» rutaba a `revisar-mr` en lugar
  de a `code-review-and-quality`.

## 0.1.1 — 2026-10-17

- `prompt-architect`: datos de modelos al día. Opus 5.5, Sonnet 5.5 y Haiku 5.5 pasan a
  ser la versión recomendada de cada nivel; los modelos anteriores quedan en una tabla
  aparte.
- `prompt-architect`: el `SKILL.md` elige nivel (Haiku, Sonnet, Opus, Fable) y deja IDs,
  precios y esfuerzos por defecto solo en `references/model-selection.md`. Si esa
  referencia tiene más de 30 días, la skill la verifica antes de recomendar.
- `prompt-architect`: recomienda siempre un esfuerzo explícito junto al modelo.
- `resolver-merge`: la tabla de modelo y esfuerzo usa niveles en lugar de versiones.

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
