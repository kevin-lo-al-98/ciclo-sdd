# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este repositorio

No contiene una aplicación: contiene **skills de Claude Code** y documentación de
referencia. El "producto" son archivos Markdown que otras sesiones de Claude Code
cargan como instrucciones.

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
- `sources/README.md` — enlaces a documentación oficial.
- `scripts/install.ps1` · `scripts/install.sh` — enlazan `skills/*` a `~/.claude/skills`.
- `mcp/` — servidor MCP que sirve las mismas skills por protocolo, como alternativa a
  instalarlas. Node con ESM, sin TypeScript. Su `README.md` explica la estructura y por
  qué la lectura de disco vive aislada del resto. Solo carga `references/`: un archivo
  en otra subcarpeta (`assets/`, `scripts/`) no llega al cliente.
- `docs/decisions/` — ADRs en formato MADR, uno por decisión, numerados `NNNN-…`.
- `docs/specs/` — specs de trabajo por hacer o en curso.

## Comandos

```powershell
.\scripts\install.ps1                        # enlaza todas las skills en ~/.claude/skills
.\scripts\install.ps1 -Skill <nombre>        # solo una (en bash: ./scripts/install.sh)
```

Sin Modo de desarrollador en Windows, el script copia en lugar de enlazar y las
ediciones del repositorio dejan de propagarse: hay que reinstalar.

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
vacío por MCP aunque Claude Code lo cargue bien instalado.

**Una skill nueva se añade también a la tabla del `README.md`.**

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

`skills/skill-security-scan/` es material de terceros: taxonomía derivada de NVIDIA
SkillSpector bajo Apache-2.0. Está **en inglés a propósito** y es la excepción a la
regla del español; el porqué está en el
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
