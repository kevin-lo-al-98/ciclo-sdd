# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este repositorio

Distribuye el **ciclo de vida del requerimiento al producto** para Claude Code:
**requerimiento → PRD → tarea → spec → código**. La mitad "qué construir" es la skill
`skills/flujo-de-requerimientos/`; la mitad "cómo implementarlo" son los comandos
`commands/sdd-*`. El resto de `skills/` es **complemento**: estándares técnicos que se
aplican dentro de la cadena, no la cadena misma
([ADR 0008](docs/decisions/0008-el-ciclo-de-vida-es-el-eje-del-repositorio.md)).

No contiene una aplicación ni los requerimientos o specs de un producto: esos viven en el
proyecto que adopta el ciclo de vida. El "producto" son archivos Markdown que otras
sesiones de Claude Code cargan como instrucciones.

Eso cambia el criterio de calidad: aquí un error no rompe un test, se propaga
silenciosamente a todas las sesiones que carguen esa skill.

La única excepción es `mcp/`, que sí es código con dependencias. El resto del
repositorio sigue sin build: no metas herramientas de JavaScript fuera de esa carpeta
([ADR 0003](docs/decisions/0003-solo-mcp-contiene-codigo.md)).

## Estructura

- `skills/<nombre>/SKILL.md` — una skill por carpeta. Frontmatter con `name` y
  `description`, y el cuerpo en Markdown.
- `skills/<nombre>/references/` — material extenso que el `SKILL.md` enlaza en lugar
  de incluir.
- `commands/<nombre>.md` — comandos de barra (`/<nombre>`) explícitos, para flujos que
  conviene invocar a propósito en vez de dejar que se disparen solos (hoy, el ciclo de
  vida SDD: `sdd-explore`, `sdd-new`, `sdd-apply`, `sdd-verify`, `sdd-continue`,
  `sdd-archive`). Frontmatter con `description` y, cuando el comando toma un argumento,
  `argument-hint`; **no** lleva `name` ni sigue el frontmatter de skill. El cuerpo usa
  `$ARGUMENTS` para el argumento posicional.
- `agents/<nombre>.md` — subagentes de Claude Code (`name`, `description`, y el cuerpo
  como system prompt). Hoy, los tres que lanza `/ship`
  ([ADR 0009](docs/decisions/0009-agregar-agents-como-tipo-de-contenido.md)).
- `.claude-plugin/plugin.json` · `.claude-plugin/marketplace.json` — el repositorio es a
  la vez plugin y marketplace de Claude Code, ambos llamados `docs-skills`
  ([ADR 0010](docs/decisions/0010-distribuir-como-plugin-y-copia-por-proyecto.md)).
- `CHANGELOG.md` — una entrada por versión publicada del plugin.
- `sources/README.md` — enlaces a documentación oficial.
- `scripts/install.ps1` · `scripts/install.sh` — enlazan `skills/*` a `~/.claude/skills`,
  `commands/*.md` a `~/.claude/commands` y `agents/*.md` a `~/.claude/agents`. Con
  `-Project` / `--project <ruta>`, copian a `<ruta>/.claude/` y dejan
  `docs-skills.version`.
- `mcp/` — servidor MCP que sirve las mismas skills por protocolo, como alternativa a
  instalarlas. Node con ESM, sin TypeScript. Su `README.md` explica la estructura y por
  qué la lectura de disco vive aislada del resto. Solo carga `references/`: un archivo
  en otra subcarpeta (`assets/`, `scripts/`) no llega al cliente.
- `docs/decisions/` — ADRs en formato MADR, uno por decisión, numerados `NNNN-…`.
- `docs/specs/` — specs de trabajo por hacer o en curso.

## Instalar y correr

```powershell
.\scripts\install.ps1                        # enlaza skills en ~/.claude/skills y comandos en ~/.claude/commands
.\scripts\install.ps1 -Skill <nombre>        # solo una skill
.\scripts\install.ps1 -Command <nombre>      # solo un comando
.\scripts\install.ps1 -Agent <nombre>        # solo un agente (en bash: ./scripts/install.sh <nombre>, busca en los tres)
```

Sin Modo de desarrollador en Windows, el script copia en lugar de enlazar y las
ediciones del repositorio dejan de propagarse: hay que reinstalar.

No tengas instalado a la vez el plugin `docs-skills` y estos enlaces: cada skill aparece
dos veces. Para probar el repositorio como plugin sin instalarlo,
`claude --plugin-dir .`.

```powershell
claude plugin validate .                     # único aviso esperado: el CLAUDE.md de la raíz
```

## Versionado

**Todo cambio que se publica sube `version` en `.claude-plugin/plugin.json` y añade su
entrada a `CHANGELOG.md`, en el mismo commit.** Con la versión fijada, quien instaló el
plugin no recibe commits nuevos hasta que el número cambia, y no hay ningún error que
avise del olvido. Semver: parche para correcciones, menor para piezas nuevas, mayor si se
renombra o quita una skill, un comando o un agente (rompe a quien lo invoca por nombre).

Como plugin, todo lleva el prefijo `docs-skills:` (`/docs-skills:sdd-new`). En el
contenido se escriben los nombres sin prefijo, que valen para las otras dos vías; no
dupliques cada mención.

```bash
cd mcp && npm install && npm start           # servidor MCP por stdio (Node >= 20)
```

El servidor lee las skills **solo al arrancar**: tras editar un `SKILL.md`, reinícialo
(`/mcp` en Claude Code). Al arrancar escribe en stderr cuántas skills cargó, lo que
sirve de comprobación rápida de que ninguna carpeta se quedó fuera.

## Convenciones

**Todo el contenido va en español**, incluidos comentarios de ejemplos de código. Los
identificadores, nombres de API y términos técnicos se mantienen en su forma original
([ADR 0001](docs/decisions/0001-contenido-de-las-skills-en-espanol.md)).

**El `description` del frontmatter es el disparador.** Determina si la skill se carga.
Debe enumerar condiciones concretas —tecnologías, palabras que el usuario usaría,
extensiones de archivo— y decir explícitamente cuándo NO aplica, para no competir con
otra skill del repositorio. Una descripción genérica produce una skill muerta.

**Explica el porqué, no solo la regla.** Es el rasgo que define el estilo de estas
skills: cada norma va acompañada de la consecuencia que evita. Una lista de reglas sin
justificación se ignora en cuanto estorba.

**El `SKILL.md` se mantiene corto.** Si una sección crece, muévela a `references/` y
enlázala. El cuerpo principal se carga entero; las referencias solo cuando hacen falta.

**`name` y `description` van en una sola línea cada uno.** El servidor MCP no usa un
parser de YAML completo (`mcp/src/skills.js`): un `description: >` multilínea llega
vacío por MCP aunque Claude Code lo cargue bien instalado. Claude Code, en cambio, sí
usa un parser de YAML: si el valor lleva `: ` o ` #`, va entre comillas simples
(`description: '…'`, con `''` para un apóstrofo). Sin ellas, Claude Code descarta la
`description` en silencio y muestra la skill con su título, sin disparadores.

**Una skill o un comando nuevo se añade también a la tabla correspondiente del
`README.md`**: a las del ciclo de vida si forma parte de la cadena o de su gobierno, a
"Skills complementarias" si es un estándar técnico.

**Los comandos de `commands/` y los agentes de `agents/` no se sirven por el servidor
MCP.** El MCP (ver más abajo)
solo expone skills — un comando de barra es una convención de Claude Code, no algo que el
protocolo MCP sepa representar. Se distribuyen por el plugin y por `scripts/install.*`.

## Servidor MCP

**Nada escribe en stdout salvo el transporte.** En stdio, stdout es el canal JSON-RPC:
un `console.log` rompe la conexión con un error que no lo menciona. Para depurar,
`console.error`.

`skills.js` y `servidor.js` no pueden importar `node:fs` ni nada de Node que no exista
en un Worker de Cloudflare: toda la lectura de disco vive en `cargar-disco.js`, que es
lo único que no viajará al despliegue remoto
([spec](docs/specs/worker-cloudflare.md)).

## Decisiones y specs

Una decisión con alternativas reales y difícil de revertir va a un ADR en
`docs/decisions/`, no a este archivo: `CLAUDE.md` se carga entero en cada sesión y solo
debe llevar la regla y el enlace, no el debate. La skill
`skills/documentar-decisiones/` es la fuente de verdad del formato y de cuándo escribir
uno; no dupliques aquí su plantilla ni sus reglas. Los ADRs aceptados no se reescriben:
los sustituye uno nuevo.

## Commits

**Sin líneas de atribución.** Ni `Co-Authored-By`, ni `Generated with`, ni firmas de
herramienta, tampoco en las descripciones de pull request. Si el entorno de Claude Code
las pide por defecto, esta regla tiene precedencia: es la convención del repositorio.

El formato y el protocolo de aprobación están en la skill
`skills/escribir-mensaje-de-commit/`, que es la fuente de verdad. No dupliques aquí sus
reglas: una convención escrita en dos sitios se contradice en cuanto una de las dos
copias cambia.

## Datos que caducan

`skills/prompt-architect/references/model-selection.md` contiene precios, IDs de modelo
y ventanas de contexto. Antes de modificar ese archivo, consulta la skill `claude-api`
o la documentación oficial: no lo actualices de memoria. El archivo lleva su fecha de
última revisión en la cabecera; actualízala al tocarlo.

Lo mismo aplica a cualquier versión de framework citada en las skills.

## Skills vendorizadas

Estas carpetas son material de terceros y están **en inglés a propósito**, como excepción
a la regla del español:

- `skills/skill-security-scan/` — taxonomía derivada de NVIDIA SkillSpector, Apache-2.0.
- De addyosmani/agent-skills, MIT: `skills/test-driven-development/`,
  `skills/code-review-and-quality/`, `skills/shipping-and-launch/`,
  `skills/security-and-hardening/`, `skills/performance-optimization/`,
  `skills/browser-testing-with-devtools/`, los comandos
  `commands/test.md`, `commands/quality-review.md` y `commands/ship.md`
  (`commands/NOTICE-agent-skills`), y todo `agents/` (`agents/NOTICE`).

El porqué está en el
[ADR 0002](docs/decisions/0002-skills-vendorizadas-en-su-idioma-original.md).

Reglas para este tipo de carpetas:

- No reescribas su contenido. Si algo hay que cambiar, se documenta en `NOTICE` con
  fecha y alcance del cambio —lo exige la licencia y evita que el siguiente que lea el
  archivo crea que es material original.
- `LICENSE` y `NOTICE` se conservan. No los muevas ni los resumas.
- Para actualizar, se trae la versión nueva de aguas arriba y se vuelve a aplicar la
  modificación local, no al revés.

## Verificación

No hay tests. Antes de dar por buena una skill nueva o modificada:

1. El frontmatter tiene `name` (kebab-case, igual al nombre de la carpeta) y
   `description`. Límites de la especificación de skills: `name` de hasta 64
   caracteres y sin `--`; `description` de hasta 1024. La tool `listar_skills` del
   servidor MCP marca con ⚠ la skill sin `description` o cuyo `name` no coincide con
   la carpeta.
2. Los enlaces relativos a `references/` resuelven, y el `SKILL.md` tiene menos de 500
   líneas.
3. La skill se activa: instálala y comprueba en una sesión nueva que Claude la carga
   ante una petición que debería dispararla.

El paso 3 es el único que detecta una `description` mal escrita.

Antes de dar por bueno un comando nuevo o modificado en `commands/`:

1. El frontmatter tiene `description` (y `argument-hint` si el comando toma un
   argumento posicional) — sin `name`, que es un campo de skill, no de comando.
2. El cuerpo usa `$ARGUMENTS` donde corresponda y no referencia rutas ni herramientas
   específicas de un proyecto (si el comando es de propósito general, como los `/sdd-*`).
3. El comando se activa: instalalo y probalo con `/<nombre> <argumento>` en una sesión
   nueva.
