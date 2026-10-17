---
name: adoptar-estructura-de-docs
description: 'Monta en un proyecto la estructura para registrar decisiones y specs —`docs/decisions/` con ADRs en formato MADR y `docs/specs/`—, fija el plugin `ciclo-sdd` para todo el equipo en `.claude/settings.json` y, si trabajan dos personas o más, deja en su `CLAUDE.md` la sección de roles del ciclo SDD. Úsala cuando el usuario pida "adoptar los ADRs en este proyecto", "montar la carpeta de decisiones", "empezar a registrar decisiones aquí", "llevar esta convención a otro repo", "configurar docs/decisions", "que todo el equipo use ciclo-sdd", "configurar los roles del ciclo", "modo pareja", "modo equipo", o cuando `documentar-decisiones` no encuentre dónde escribir. Solo prepara la estructura una vez; para escribir un ADR concreto usa `documentar-decisiones`. No la uses si el proyecto ya tiene un sistema de ADRs (`.adrs/`, `docs/adr/`, ADR Zoom): se detiene y pregunta.'
---

# Adoptar la estructura de decisiones en un proyecto

Prepara un proyecto para registrar decisiones con MADR y para que todo su equipo use
ciclo-sdd. Es una operación puntual: deja la carpeta, la plantilla, la forma de
instalación y, si hace falta, los roles; a partir de ahí el trabajo diario es de
`documentar-decisiones` y de los comandos `/sdd-*`.

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

Comprueba también si el `CLAUDE.md` del proyecto existe y qué dice ya sobre decisiones
o roles, para no duplicarlo; si `.claude/settings.json` ya declara el plugin
`ciclo-sdd`; y si existe `.claude/ciclo-sdd.version`, que indica una copia por proyecto.

Pregunta **cuántas personas trabajan en el proyecto** y si quien pide y quien construye son
personas distintas. De eso salen el modo de roles (paso 4.6) y si conviene
`flujo-de-requerimientos`.

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
- la vía de instalación elegida (ver [Cómo llega ciclo-sdd al
  proyecto](#cómo-llega-ciclo-sdd-al-proyecto)) y lo que escribe en `.claude/`.
- con dos personas o más, el modo de roles y la tabla con los nombres que haya dado el
  usuario.
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
   `documentar-decisiones` del servidor MCP `ciclo-sdd` con `buscar_skills` y
   `leer_skill`; no las cargues enteras por costumbre.
   ```

   Este aviso solo hace falta en la vía MCP. Con el plugin o con la copia por proyecto,
   Claude Code carga las skills por su `description` y el aviso sobra: en ese caso
   escribe la sección sin la frase del servidor MCP.
5. **La instalación para el equipo**, según la vía elegida:
   - **Plugin** (por defecto): desde la raíz del proyecto,
     `claude plugin marketplace add kevin-lo-al-98/ciclo-sdd --scope project` y
     `claude plugin install ciclo-sdd@ciclo-sdd --scope project`. Los dos escriben en
     `.claude/settings.json`, que se versiona; a cada miembro que confíe en la carpeta,
     Claude Code le ofrece el plugin.
   - **Copia por proyecto**: `scripts/install.ps1 -Project <ruta>` o
     `scripts/install.sh --project <ruta>` desde el clon de ciclo-sdd. Deja todo en
     `<ruta>/.claude/` y la versión en `.claude/ciclo-sdd.version`.
6. **Los roles**, solo con dos personas o más: la sección «Ciclo de vida: roles» al final
   del `CLAUDE.md`, con la plantilla y el criterio de modo de
   [`references/roles-del-ciclo.md`](references/roles-del-ciclo.md). En solitario no la
   escribas: sin ella el modo es `solo`, que es lo correcto.

Al terminar, **no commitees**: deja los archivos sin añadir y dilo. El commit sigue el
protocolo del proyecto, que aquí no conoces.

## Cómo llega ciclo-sdd al proyecto

| Vía | Cuándo | Comandos `/sdd-*` y agentes | Nombres |
|---|---|---|---|
| **Plugin** | Por defecto; el equipo tiene acceso a GitHub | Sí | Con prefijo: `/ciclo-sdd:sdd-new`, `ciclo-sdd:documentar-decisiones` |
| **Copia por proyecto** | Sin red o sin `/plugin`, o si se quiere la copia dentro del repositorio | Sí | Sin prefijo: `/sdd-new` |
| **MCP local** | Clientes que no son Claude Code | No, solo skills | Se consultan con `buscar_skills` y `leer_skill` |

No combines el plugin con la copia por proyecto, ni con los enlaces de `~/.claude` de quien
mantiene ciclo-sdd: cada skill aparecería dos veces.

## Por qué hace falta el aviso del `CLAUDE.md` en la vía MCP

Cuando las skills se sirven por MCP, Claude Code **no las activa solo**: las carga por
`description` únicamente cuando están instaladas en `~/.claude/skills`. Por MCP, el modelo
tiene que llamar a las tools, y no lo hace si nada se lo sugiere. Sin ese aviso, la
estructura existe pero en la sesión siguiente nadie recuerda que hay una skill para
usarla.

## Conectar el servidor MCP

Si el usuario aún no lo tiene registrado, indícale el comando (con `-s user` queda
disponible en todos sus proyectos, no solo en el actual):

```bash
claude mcp add ciclo-sdd -s user -- node <ruta-al-repositorio>/mcp/src/stdio.js
```

Requiere `npm install` previo dentro de `mcp/`. El servidor lee las skills al arrancar:
tras cambiar una skill hay que reiniciarlo con `/mcp`. El servidor es local, así que solo
sirve en la máquina donde está el repositorio; para un equipo con Claude Code, la vía es
el plugin.
