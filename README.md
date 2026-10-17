# docs-skills

Repositorio personal de desarrollo fullstack: skills de Claude Code por especialidad,
más fuentes de referencia curadas.

La idea es generalista a propósito. En lugar de una guía única que intenta cubrirlo
todo, hay una skill por especialidad y Claude carga la que corresponde a la tarea que
tenga delante.

## Skills

| Skill | Cubre |
|---|---|
| [`prompt-architect`](skills/prompt-architect/) | Elegir el modelo adecuado y redactar el prompt antes de empezar |
| [`frontend-react-ts`](skills/frontend-react-ts/) | React + TypeScript: tipado, estado, rendimiento, accesibilidad |
| [`frontend-angular`](skills/frontend-angular/) | Angular moderno: standalone, signals, RxJS, formularios |
| [`frontend-astro`](skills/frontend-astro/) | Astro: islas, estático vs servidor, content collections |
| [`backend-node-ts`](skills/backend-node-ts/) | APIs en Node + TypeScript: capas, validación, errores, seguridad |
| [`database-sql`](skills/database-sql/) | Modelado, índices, consultas, migraciones sin downtime |
| [`typescript-estricto`](skills/typescript-estricto/) | Satisfacer el perfil estricto del compilador sin relajarlo |
| [`escribir-mensaje-de-commit`](skills/escribir-mensaje-de-commit/) | Mensajes con Conventional Commits y protocolo de aprobación |
| [`git-worktree`](skills/git-worktree/) | Varias ramas a la vez con `git worktree`, sin `stash`; y aplastar una rama en un commit |
| [`resolver-merge`](skills/resolver-merge/) | Resolver conflictos de merge |
| [`sonarqube-community`](skills/sonarqube-community/) | SonarQube Community: puesta en marcha, ramas y PRs, triage |
| [`skill-security-scan`](skills/skill-security-scan/) | Auditar la seguridad de una skill de terceros (material vendorizado) |
| [`documentar-decisiones`](skills/documentar-decisiones/) | ADRs en formato MADR y specs |
| [`adoptar-estructura-de-docs`](skills/adoptar-estructura-de-docs/) | Montar `docs/decisions/` y `docs/specs/` en otro proyecto |
| [`mantener-claude-md`](skills/mantener-claude-md/) | Mantener corto el `CLAUDE.md`, índice de documentación y protocolo de lectura |
| [`flujo-de-requerimientos`](skills/flujo-de-requerimientos/) | Cadena requerimiento → PRD → tarea → spec con trazabilidad (experimental) |
| [`cerrar-plan-o-spec-con-regla-de-oro`](skills/cerrar-plan-o-spec-con-regla-de-oro/) | Cerrar un paso de un plan/spec dejando constancia de lo que pasó realmente |
| [`documentacion-humana`](skills/documentacion-humana/) | Estructura y estilo para README y la carpeta `/docs` orientada a personas |

`prompt-architect` es la que más se usa fuera de una tarea concreta: responde "¿qué
modelo uso para esto?" y "¿cómo le pido esto bien?".

## Comandos

Además de las skills (que Claude carga solo cuando la tarea las dispara), `commands/`
tiene el ciclo de vida de un cambio SDD (Spec Driven Development) como comandos
explícitos, agnósticos de stack y de proyecto:

| Comando | Fase |
|---|---|
| [`/sdd-explore`](commands/sdd-explore.md) | Explorar un tema con evidencia, sin crear el cambio (desechable) |
| [`/sdd-new`](commands/sdd-new.md) | Abrir el cambio y llevarlo hasta `tasks`, pausando para aprobación |
| [`/sdd-apply`](commands/sdd-apply.md) | Implementar las tareas pendientes con evidencia |
| [`/sdd-verify`](commands/sdd-verify.md) | Construir la Spec Compliance Matrix y el veredicto PASS/FAIL |
| [`/sdd-continue`](commands/sdd-continue.md) | Retomar un cambio existente desde su fase pendiente |
| [`/sdd-archive`](commands/sdd-archive.md) | Fundir la delta en `openspec/specs/` y archivar el cambio |

El orden es siempre `explore → new → apply → verify → continue (si se interrumpe) →
archive`. Los artefactos de cada cambio viven en `openspec/changes/<nombre>/`, en la raíz
del proyecto que adopta estos comandos (no en este repositorio).

## Instalación

Las skills viven en `~/.claude/skills` y los comandos en `~/.claude/commands`. El
script los enlaza desde aquí, así que editar el repositorio actualiza lo instalado sin
reinstalar.

```powershell
# Windows
.\scripts\install.ps1
```

```bash
# macOS / Linux
./scripts/install.sh
```

Para instalar solo una skill o un comando: `.\scripts\install.ps1 -Skill prompt-architect`
o `.\scripts\install.ps1 -Command sdd-new` (en bash, `./scripts/install.sh sdd-new`
funciona para ambos tipos porque busca por nombre en los dos directorios).

En Windows, los enlaces simbólicos requieren el Modo de desarrollador activado
(Configuración → Sistema → Para desarrolladores) o una consola de administrador. Sin
eso, el script copia los archivos y avisa de que los cambios no se propagarán solos.

Reinicia Claude Code después de instalar.

## Fuentes

[`sources/README.md`](sources/README.md) reúne la documentación oficial por tecnología.
Solo entra ahí fuente primaria o material que se mantiene al día.

## Decisiones y specs

Las decisiones de este repositorio están en [`docs/decisions/`](docs/decisions/), en
formato MADR; empieza por la
[0000](docs/decisions/0000-usar-madr-para-registrar-decisiones.md), que explica el
formato. Las specs de trabajo pendiente están en [`docs/specs/`](docs/specs/).

Para llevar esta misma estructura a otro proyecto, ver
[`adoptar-estructura-de-docs`](skills/adoptar-estructura-de-docs/) y la sección
"Adoptar en otro proyecto" de [`mcp/README.md`](mcp/README.md).

## Añadir una skill

Una skill es una carpeta con un `SKILL.md` que empieza por frontmatter:

```markdown
---
name: mi-skill
description: Qué cubre y, sobre todo, cuándo debe activarse.
---
```

El `description` es lo que decide si la skill se carga o no, así que enumera los
disparadores concretos: tecnologías, palabras que usarías al pedirlo, tipos de archivo.
Una descripción vaga produce una skill que nunca se activa.

El contenido extenso va en `references/` y se enlaza desde el `SKILL.md`; así el cuerpo
principal se mantiene corto y solo se lee el detalle cuando hace falta.

## Añadir un comando

Un comando es un único archivo `commands/<nombre>.md` con frontmatter `description` (y
`argument-hint` si toma un argumento posicional) — sin `name`, que es un campo de skill,
no de comando. El cuerpo usa `$ARGUMENTS` para ese argumento. Se reserva para flujos que
conviene invocar a propósito, con fases ordenadas o argumentos explícitos, en vez de
dejar que se disparen solos como una skill.
