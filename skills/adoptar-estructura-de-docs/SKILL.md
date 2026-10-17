---
name: adoptar-estructura-de-docs
description: 'Monta en un proyecto la estructura para registrar decisiones y specs —`docs/decisions/` con ADRs en formato MADR y `docs/specs/`— y deja en su `CLAUDE.md` el aviso para que las sesiones futuras usen el servidor MCP `docs-skills`. Úsala cuando el usuario pida "adoptar los ADRs en este proyecto", "montar la carpeta de decisiones", "empezar a registrar decisiones aquí", "llevar esta convención a otro repo", "configurar docs/decisions", o cuando `documentar-decisiones` no encuentre dónde escribir. Solo prepara la estructura una vez; para escribir un ADR concreto usa `documentar-decisiones`. No la uses si el proyecto ya tiene un sistema de ADRs (`.adrs/`, `docs/adr/`, ADR Zoom): se detiene y pregunta.'
---

# Adoptar la estructura de decisiones en un proyecto

Prepara un proyecto para registrar decisiones con MADR. Es una operación puntual: deja
la carpeta, la plantilla y el aviso en `CLAUDE.md`, y a partir de ahí el trabajo diario
es de `documentar-decisiones`.

Escribe archivos en un repositorio ajeno, y una convención mal aplicada allí cuesta más
de deshacer que de preguntar. Por eso el orden es **detectar, proponer, esperar, crear**.

## 1. Detectar lo que ya hay

Antes de proponer nada, mira el proyecto:

| Encuentras | Qué significa | Qué haces |
|---|---|---|
| `docs/decisions/` con `0000-…` | Ya usa MADR | Nada que montar; usa `documentar-decisiones` |
| `.adrs/`, `ADR-XXX-…` con frontmatter propio | Sistema propio (p. ej. ADR Zoom) | **Detente.** Dilo y no propongas MADR encima |
| `docs/adr/`, `doc/adr/`, `NNNN-*.md` sin frontmatter | Otro formato (Nygard, adr-tools) | **Pregunta:** seguir con ese, o migrar a MADR |
| Nada | Proyecto sin ADRs | Sigue en el paso 2 |

Mezclar dos formatos en un proyecto deja dos convenciones a medias. Si algo ya está
en uso, la decisión de cambiarlo es del usuario, no de esta skill. Migrar ADRs
existentes queda fuera de su alcance.

Comprueba también si el `CLAUDE.md` del proyecto existe y qué dice ya sobre decisiones,
para no duplicarlo.

## 2. Proponer

Muestra en texto, antes de crear nada:

- el árbol que se creará:
  ```
  docs/decisions/plantilla-adr.md
  docs/decisions/0000-usar-madr-para-registrar-decisiones.md
  docs/specs/            (vacía, con un .gitkeep)
  ```
- el texto exacto que se añadirá al `CLAUDE.md` (paso 4), o que se creará el archivo si
  no existe.
- si el proyecto ya tiene una carpeta `docs/`, que estas dos se añaden sin tocar el
  resto.

## 3. Esperar aprobación

Un "sí", "dale" o "ok" basta. Un comentario ambiguo no lo es: vuelve a preguntar.

## 4. Crear

1. **`docs/decisions/plantilla-adr.md`**: la plantilla de `documentar-decisiones`
   (`references/plantilla-madr.md`, tanto la completa como la mínima). Léela con
   `leer_skill` si la skill se sirve por MCP, o desde su carpeta si está instalada.
2. **`docs/decisions/0000-usar-madr-para-registrar-decisiones.md`**: el ADR que abre
   toda serie MADR, con [`references/adr-0000.md`](references/adr-0000.md) como base.
   Ajusta la fecha y quién decide; estado `accepted` solo si el usuario acaba de
   aprobarlo, que es el caso aquí.
3. **`docs/specs/.gitkeep`**, para que la carpeta exista en el repositorio.
4. **El aviso en `CLAUDE.md`**, **al final** del archivo, sin reescribir nada:

   ```markdown
   ## Decisiones y specs

   Las decisiones de arquitectura se registran en `docs/decisions/` (formato MADR) y las
   specs en `docs/specs/`. Para escribir o revisar un ADR o una spec, consulta la skill
   `documentar-decisiones` del servidor MCP `docs-skills` con `buscar_skills` y
   `leer_skill`; no las cargues enteras por costumbre.
   ```

   Si el usuario prefiere **instalar las skills** con `scripts/install.*` en lugar de usar
   el servidor MCP, el aviso sobra: Claude Code las carga solo por su `description`. Pregunta
   cuál usa antes de escribirlo.

Al terminar, **no commitees**: deja los archivos sin añadir y dilo. El commit sigue el
protocolo del proyecto, que aquí no conoces.

## Por qué hace falta el aviso del `CLAUDE.md`

Cuando las skills se sirven por MCP, Claude Code **no las activa solo**: las carga por
`description` únicamente cuando están instaladas en `~/.claude/skills`. Por MCP, el modelo
tiene que llamar a las tools, y no lo hace si nada se lo sugiere. Sin ese aviso, la
estructura existe pero en la sesión siguiente nadie recuerda que hay una skill para
usarla.

## Conectar el servidor MCP

Si el usuario aún no lo tiene registrado, indícale el comando (con `-s user` queda
disponible en todos sus proyectos, no solo en el actual):

```bash
claude mcp add docs-skills -s user -- node <ruta-al-repositorio>/mcp/src/stdio.js
```

Requiere `npm install` previo dentro de `mcp/`. El servidor lee las skills al arrancar:
tras cambiar una skill hay que reiniciarlo con `/mcp`. Hoy el servidor es local, así
que solo sirve en la máquina donde está el repositorio.
