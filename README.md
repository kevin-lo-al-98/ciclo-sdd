# docs-skills

Repositorio personal que distribuye el **ciclo de vida del requerimiento al producto**
para Claude Code, agnóstico de stack y de proyecto.

La cadena de trabajo es **requerimiento → PRD → tarea → spec → código**, con un dueño por
etapa y el PRD normativo aguas arriba de las specs. Un catálogo de skills por
especialidad la complementa en la etapa de construcción.

Este repositorio **no** contiene requerimientos ni specs propios: los artefactos de cada
cambio viven en el proyecto que adopta el ciclo de vida. Lo único que es código aquí es
el servidor MCP ([`mcp/`](mcp/)), que sirve las skills por protocolo.

## Enfoque

- **La cadena, de punta a punta.** Dos piezas forman una sola cadena:
  [`flujo-de-requerimientos`](skills/flujo-de-requerimientos/) cubre **qué construir**
  (`REQ → PRD → TAREA → spec`), y los comandos `/sdd-*` cubren **cómo implementarlo**
  (`spec → código → verificación → archivo`).
- **Spec-Driven Development (SDD).** El desarrollo no arranca en el código ni en tareas
  sueltas, sino en una spec verificable derivada del PRD, siguiendo
  `explore → new → apply → verify → archive`.
- **Frontera qué vs. cómo.** Producto es dueño del *qué* (requerimiento, PRD, tarea); quien
  construye es dueño del *cómo* (spec, decisiones, código). Una contradicción entre spec y
  PRD se levanta contra Producto, no se resuelve en la spec.
- **Skills como complemento.** Las skills técnicas (frontend, backend, base de datos, git…)
  no son la cadena: son los estándares que se aplican dentro de ella mientras se construye.
- **Decisiones registradas.** Cada decisión con alternativas reales queda en un ADR (MADR),
  en este repositorio y en el que lo adopta.
- **Contexto para agentes.** Se instala como plugin de Claude Code, se copia al proyecto o
  se sirve por MCP, para que el agente consulte reglas y procedimientos en vez de
  inventarlos.
- **De una persona a un equipo.** Los mismos comandos funcionan en solitario, en pareja o en
  un equipo con roles; ver [Según el tamaño del equipo](#según-el-tamaño-del-equipo).

## Ciclo de vida: requerimiento → producto → código

```
REQ-NNN  →  PRD-NNN  →  TAREA-NNN  →  spec  →  código
quien pide   producto     producto     quien construye
└──────── flujo-de-requerimientos ──────┘└──── /sdd-* ────┘
```

### Qué construir

| Pieza | Cubre |
|---|---|
| [`flujo-de-requerimientos`](skills/flujo-de-requerimientos/) | Cadena requerimiento → PRD → tarea → spec con trazabilidad en una sola tabla (experimental) |
| [`entrevistar-con-contexto`](skills/entrevistar-con-contexto/) | Poner a prueba un plan contra el glosario y las decisiones del proyecto |
| [`gestionar-roadmap`](skills/gestionar-roadmap/) | `ROADMAP.md` único que indexa (sin duplicar) los cambios SDD y los PRDs |

### Cómo implementarlo

Comandos explícitos, agnósticos de stack y de proyecto:

| Comando | Fase |
|---|---|
| [`/sdd-explore`](commands/sdd-explore.md) | Explorar un tema con evidencia, sin crear el cambio (desechable) |
| [`/sdd-new`](commands/sdd-new.md) | Abrir el cambio y llevarlo hasta `tasks`, pausando para aprobación |
| [`/sdd-apply`](commands/sdd-apply.md) | Implementar las tareas pendientes con evidencia |
| [`/sdd-verify`](commands/sdd-verify.md) | Construir la Spec Compliance Matrix y el veredicto PASS/FAIL |
| [`/sdd-continue`](commands/sdd-continue.md) | Retomar un cambio existente desde su fase pendiente |
| [`/sdd-archive`](commands/sdd-archive.md) | Fundir la delta en `openspec/specs/` y archivar el cambio |

El orden es siempre `explore → new → apply → verify → continue (si se interrumpe) →
archive`. Cuando la etapa "spec" de `flujo-de-requerimientos` termina, el siguiente paso
es `/sdd-new <nombre-del-cambio>` sobre esa spec. Los artefactos viven en
`openspec/changes/<nombre>/`, en la raíz del proyecto que adopta los comandos.

### Probar, revisar y salir a producción

Las compuertas de calidad de la etapa de construcción: `/sdd-apply` implementa con tests,
el cambio se revisa antes del merge y se despliega con plan de vuelta atrás. Vienen de
[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) (MIT), en inglés y
sin reescribir ([ADR 0002](docs/decisions/0002-skills-vendorizadas-en-su-idioma-original.md)).

| Comando | Skill | Cubre |
|---|---|---|
| [`/test`](commands/test.md) | [`test-driven-development`](skills/test-driven-development/) | Rojo-verde-refactor, y reproducir un bug con un test antes de arreglarlo |
| [`/quality-review`](commands/quality-review.md) | [`code-review-and-quality`](skills/code-review-and-quality/) | Revisión del código en cinco ejes (correctitud, legibilidad, arquitectura, seguridad, rendimiento) |
| [`/ship`](commands/ship.md) | [`shipping-and-launch`](skills/shipping-and-launch/) | Checklist previa al lanzamiento, revisión en paralelo, GO / NO-GO y plan de rollback |
| — | [`security-and-hardening`](skills/security-and-hardening/) | Modelo de amenazas, OWASP, entrada no confiable, dependencias, datos personales |
| — | [`performance-optimization`](skills/performance-optimization/) | Medir antes de optimizar: Core Web Vitals, N+1, índices, caché, pool de conexiones |
| — | [`browser-testing-with-devtools`](skills/browser-testing-with-devtools/) | Verificar en un navegador real lo que hacen las skills de frontend: consola, red, DOM, capturas, accesibilidad (requiere el MCP `chrome-devtools`) |

`/quality-review` es el `/review` de origen con otro nombre, para no chocar con el
`/review` que ya trae Claude Code. `/ship` lanza en paralelo tres subagentes de
[`agents/`](agents/): `code-reviewer`, `security-auditor` y `test-engineer`
([ADR 0009](docs/decisions/0009-agregar-agents-como-tipo-de-contenido.md)).

`code-review-and-quality` revisa el código; `revisar-mr` revisa que el cambio cumpla su
spec y su PRD. Un MR pasa por las dos.

### Gobierno del ciclo

| Skill | Cubre |
|---|---|
| [`documentar-decisiones`](skills/documentar-decisiones/) | ADRs en formato MADR y specs |
| [`adoptar-estructura-de-docs`](skills/adoptar-estructura-de-docs/) | Montar `docs/decisions/` y `docs/specs/` en otro proyecto, fijar el plugin para el equipo y declarar los roles del ciclo |
| [`cerrar-plan-o-spec-con-regla-de-oro`](skills/cerrar-plan-o-spec-con-regla-de-oro/) | Cerrar un paso de un plan/spec dejando constancia de lo que pasó realmente |
| [`revisar-mr`](skills/revisar-mr/) | Revisar un MR/PR contra su spec, su PRD y las decisiones vigentes |
| [`escribir-auditoria-tecnica`](skills/escribir-auditoria-tecnica/) | Documentos de auditoría/análisis técnico independientes bajo `docs/` |

## Skills complementarias

Mientras se construye, cada etapa se apoya en una skill por especialidad. Claude carga la
que corresponde a la tarea que tenga delante; no forman parte de la cadena, la sirven.

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
| [`skill-security-scan`](skills/skill-security-scan/) | Auditar la seguridad de una skill de terceros (vendorizada, en inglés) |
| [`mantener-claude-md`](skills/mantener-claude-md/) | Mantener corto el `CLAUDE.md`, índice de documentación y protocolo de lectura |
| [`handoff`](skills/handoff/) | Comprimir la conversación en un documento de traspaso para otra sesión |
| [`documentacion-humana`](skills/documentacion-humana/) | Estructura y estilo para README y la carpeta `/docs` orientada a personas |

## Según el tamaño del equipo

El mismo repositorio sirve para una persona o para un equipo con roles. Lo que cambia es
qué piezas se usan y el modo de roles que se declara en el `CLAUDE.md` del proyecto
([ADR 0011](docs/decisions/0011-roles-y-dueno-en-el-ciclo-sdd.md)). La skill
[`adoptar-estructura-de-docs`](skills/adoptar-estructura-de-docs/) pregunta el tamaño y lo
deja configurado.

| | Una persona | Dos personas | Equipo con roles |
|---|---|---|---|
| Modo de roles | `solo` (por defecto, no se configura nada) | `pareja` | `equipo` |
| Qué construir | `documentar-decisiones` y `gestionar-roadmap` | Lo mismo; si una pide y la otra construye, `flujo-de-requerimientos` en tamaño **Ligera** | `flujo-de-requerimientos` en tamaño **Completa**, o **Con firmas** si hay que dejar constancia de quién validó |
| Cómo implementarlo | `/sdd-*` | `/sdd-*`, cada cambio con `dueño`; verifica la otra persona | `/sdd-*` con la tabla de roles: quién aprueba el plan, quién verifica, quién archiva |
| Revisar y salir | `/test`, `/quality-review` | Además `revisar-mr`, `git-worktree`, `resolver-merge` | Además `/ship` y protección de ramas con revisores obligatorios |
| Instalación | Plugin a nivel de usuario | Plugin fijado en el proyecto | Plugin fijado en el proyecto |

`flujo-de-requerimientos` sigue siendo **experimental**: el plan para probarlo con trabajo
real está en [`docs/specs/piloto-flujo-de-requerimientos.md`](docs/specs/piloto-flujo-de-requerimientos.md).

## Instalación

Hay tres vías ([ADR 0010](docs/decisions/0010-distribuir-como-plugin-y-copia-por-proyecto.md)).
Elige **una** por máquina: combinarlas duplica cada skill.

### Plugin de Claude Code (recomendado)

Trae skills, comandos y subagentes juntos, con versión:

```
/plugin install docs-skills --marketplace kevin-lo-al-98/docs-skills
```

o, en dos pasos, `/plugin marketplace add kevin-lo-al-98/docs-skills` y
`/plugin install docs-skills@docs-skills`.

Como plugin, todo lleva el prefijo `docs-skills:`: los comandos son `/docs-skills:sdd-new`,
`/docs-skills:ship`, etc. En este README aparecen sin prefijo, como en las otras dos vías.

**Para que lo use todo un equipo**, desde la raíz del proyecto adoptante:

```bash
claude plugin marketplace add kevin-lo-al-98/docs-skills --scope project
claude plugin install docs-skills@docs-skills --scope project
```

Los dos comandos escriben en `.claude/settings.json`; versiónalo, y a cada miembro que
confíe en la carpeta Claude Code le ofrecerá el plugin. Las actualizaciones llegan cuando
sube la versión ([`CHANGELOG.md`](CHANGELOG.md)), con `/plugin marketplace update
docs-skills` o con la actualización automática activada en `/plugin`.

### Copia por proyecto

Para entornos sin acceso a GitHub o sin `/plugin`, o si se quiere la copia dentro del
repositorio adoptante. Copia (nunca enlaza) a `<proyecto>/.claude/` y deja
`.claude/docs-skills.version` con la versión y el commit de origen:

```powershell
.\scripts\install.ps1 -Project ..\mi-proyecto
```

```bash
./scripts/install.sh --project ../mi-proyecto
```

Admite los mismos filtros que la instalación de usuario (`-Skill`, `-Command`, `-Agent`, o
un nombre en bash). Para actualizar, se vuelve a ejecutar y se versiona el resultado.

### Enlaces en `~/.claude` (para quien mantiene el catálogo)

Enlaza skills, comandos y subagentes desde este clon, así que editar el repositorio
actualiza lo instalado sin reinstalar:

```powershell
# Windows
.\scripts\install.ps1
```

```bash
# macOS / Linux
./scripts/install.sh
```

Para instalar una sola pieza: `.\scripts\install.ps1 -Skill prompt-architect`,
`.\scripts\install.ps1 -Command sdd-new` o `.\scripts\install.ps1 -Agent code-reviewer`
(en bash, `./scripts/install.sh <nombre>` busca por nombre en los tres directorios).

En Windows, los enlaces simbólicos requieren el Modo de desarrollador activado
(Configuración → Sistema → Para desarrolladores) o una consola de administrador. Sin
eso, el script copia los archivos y avisa de que los cambios no se propagarán solos.

Reinicia Claude Code después de instalar.

### Servidor MCP

Sirve solo las skills, no los comandos ni los subagentes
([ADR 0007](docs/decisions/0007-agregar-commands-como-tipo-de-contenido-nuevo.md),
[ADR 0009](docs/decisions/0009-agregar-agents-como-tipo-de-contenido.md)), y es local.
Sirve para clientes que no son Claude Code; ver [`mcp/README.md`](mcp/README.md).

## Publicar una versión

Con el plugin, quien lo instaló no recibe un cambio hasta que sube `version` en
[`.claude-plugin/plugin.json`](.claude-plugin/plugin.json). Cada cambio publicado sube la
versión (semver: parche para correcciones, menor para piezas nuevas, mayor si se renombra
o quita algo) y añade su entrada a [`CHANGELOG.md`](CHANGELOG.md). Antes de publicar,
`claude plugin validate .` tiene que pasar; el único aviso esperado es el de `CLAUDE.md`
en la raíz, que es para quien mantiene el repositorio y el plugin no lo carga.

## Decisiones y specs

Las decisiones de este repositorio están en [`docs/decisions/`](docs/decisions/), en
formato MADR; empieza por la
[0000](docs/decisions/0000-usar-madr-para-registrar-decisiones.md), que explica el
formato, y la [0008](docs/decisions/0008-el-ciclo-de-vida-es-el-eje-del-repositorio.md),
que fija el ciclo de vida como eje. Las specs de trabajo pendiente están en
[`docs/specs/`](docs/specs/).

Para llevar esta misma estructura a otro proyecto, ver
[`adoptar-estructura-de-docs`](skills/adoptar-estructura-de-docs/) y la sección
"Adoptar en otro proyecto" de [`mcp/README.md`](mcp/README.md).

## Fuentes

[`sources/README.md`](sources/README.md) reúne la documentación oficial por tecnología.
Solo entra ahí fuente primaria o material que se mantiene al día.

## Añadir un comando

Un comando es un único archivo `commands/<nombre>.md` con frontmatter `description` (y
`argument-hint` si toma un argumento posicional) — sin `name`, que es un campo de skill,
no de comando. El cuerpo usa `$ARGUMENTS` para ese argumento. Se reserva para flujos que
conviene invocar a propósito, con fases ordenadas o argumentos explícitos, en vez de
dejar que se disparen solos como una skill.

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

Añádela a la tabla que le corresponda: a una de las del ciclo de vida si forma parte de
la cadena o de su gobierno, o a "Skills complementarias" si es un estándar técnico que se
aplica dentro de ella.
