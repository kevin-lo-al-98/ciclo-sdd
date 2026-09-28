# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este repositorio

No contiene una aplicación: contiene **skills de Claude Code** y documentación de
referencia. No hay build, ni dependencias, ni tests. El "producto" son archivos
Markdown que otras sesiones de Claude Code cargan como instrucciones.

Eso cambia el criterio de calidad: aquí un error no rompe un test, se propaga
silenciosamente a todas las sesiones que carguen esa skill.

## Estructura

- `skills/<nombre>/SKILL.md` — una skill por carpeta. Frontmatter con `name` y
  `description`, y el cuerpo en Markdown.
- `skills/<nombre>/references/` — material extenso que el `SKILL.md` enlaza en lugar
  de incluir.
- `sources/README.md` — enlaces a documentación oficial.
- `scripts/install.ps1` · `scripts/install.sh` — enlazan `skills/*` a `~/.claude/skills`.

## Convenciones

**Todo el contenido va en español**, incluidos comentarios de ejemplos de código. Los
identificadores, nombres de API y términos técnicos se mantienen en su forma original.

**El `description` del frontmatter es el disparador.** Determina si la skill se carga.
Debe enumerar condiciones concretas —tecnologías, palabras que el usuario usaría,
extensiones de archivo— y decir explícitamente cuándo NO aplica, para no competir con
otra skill del repositorio. Una descripción genérica produce una skill muerta.

**Explica el porqué, no solo la regla.** Es el rasgo que define el estilo de estas
skills: cada norma va acompañada de la consecuencia que evita. Una lista de reglas sin
justificación se ignora en cuanto estorba.

**El `SKILL.md` se mantiene corto.** Si una sección crece, muévela a `references/` y
enlázala. El cuerpo principal se carga entero; las referencias solo cuando hacen falta.

## Datos que caducan

`skills/prompt-architect/references/model-selection.md` contiene precios, IDs de modelo
y ventanas de contexto. Antes de modificar ese archivo, consulta la skill `claude-api`
o la documentación oficial: no lo actualices de memoria. El archivo lleva su fecha de
última revisión en la cabecera; actualízala al tocarlo.

Lo mismo aplica a cualquier versión de framework citada en las skills.

## Verificación

No hay tests. Antes de dar por buena una skill nueva o modificada:

1. El frontmatter tiene `name` (kebab-case, igual al nombre de la carpeta) y
   `description`.
2. Los enlaces relativos a `references/` resuelven.
3. La skill se activa: instálala y comprueba en una sesión nueva que Claude la carga
   ante una petición que debería dispararla.

El paso 3 es el único que detecta una `description` mal escrita.
