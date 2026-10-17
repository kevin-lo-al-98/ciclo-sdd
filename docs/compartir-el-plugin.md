# Compartir docs-skills

Cómo instalar docs-skills en la computadora de otra persona, en otra computadora tuya o en
un proyecto donde trabajan varios, y cómo hacer llegar las mejoras a todos.

## Qué es el plugin

Un plugin es un paquete que Claude Code instala de una vez. El de docs-skills trae:

- las **skills** de [`skills/`](../skills/), que se activan solas según lo que pidas;
- los **comandos** de [`commands/`](../commands/) (`/sdd-new`, `/ship`…);
- los **subagentes** de [`agents/`](../agents/), que lanza `/ship`.

El repositorio [kevin-lo-al-98/docs-skills](https://github.com/kevin-lo-al-98/docs-skills)
es público: quien lo instala no necesita cuenta en él ni permisos.

### Qué cambia al usarlo como plugin

Los comandos llevan delante el nombre del plugin, para no chocar con los de otros plugins:

| Instalado con los scripts de `~/.claude` | Instalado como plugin |
|---|---|
| `/sdd-new mi-cambio` | `/docs-skills:sdd-new mi-cambio` |
| `/ship` | `/docs-skills:ship` |

Las skills también llevan el prefijo (`docs-skills:documentar-decisiones`), pero no hace
falta escribirlas: Claude las carga solo cuando el pedido encaja con su descripción.

## Requisitos

- [Claude Code](https://code.claude.com) instalado.
- [git](https://git-scm.com) instalado: Claude Code lo usa para descargar el plugin.

## Instalarlo en la computadora de un compañero

1. Abre Claude Code en cualquier carpeta.
2. Escribe:

   ```
   /plugin install docs-skills --marketplace kevin-lo-al-98/docs-skills
   ```

3. Cierra Claude Code y vuelve a abrirlo.
4. Comprueba que funciona: escribe `/docs-skills:` y deberían aparecer los comandos
   `sdd-*`, `test`, `quality-review` y `ship`. O pide algo normal, como «haz el commit», y
   Claude cargará la skill que corresponda.

Para ver qué tienes instalado: `/plugin`, pestaña **Installed**, o `claude plugin list` en
la terminal.

## Usarlo desde otra computadora tuya

Depende de lo que vayas a hacer en ella:

| Vas a… | Usa | Por qué |
|---|---|---|
| Solo usar las skills y los comandos | El plugin, igual que [un compañero](#instalarlo-en-la-computadora-de-un-compañero) | No hace falta clonar ni ejecutar scripts |
| Editar docs-skills | Un clon con los enlaces de `~/.claude` | Tus ediciones se ven al instante, sin publicar versiones |

Para editar:

```powershell
git clone https://github.com/kevin-lo-al-98/docs-skills.git
cd docs-skills
.\scripts\install.ps1        # en macOS o Linux: ./scripts/install.sh
```

**Usa una sola vía por computadora.** Con el plugin y los enlaces a la vez, cada skill y
cada comando aparecen dos veces.

## Fijarlo en un proyecto de equipo

Si varias personas trabajan en el mismo repositorio, en vez de pedirle a cada una que lo
instale, déjalo declarado en el proyecto. Una persona lo hace una vez, desde la raíz del
proyecto:

```bash
claude plugin marketplace add kevin-lo-al-98/docs-skills --scope project
claude plugin install docs-skills@docs-skills --scope project
```

Los dos comandos escriben en `.claude/settings.json`. Haz commit y push de ese archivo.
Cuando un compañero haga `git pull` y abra el proyecto con Claude Code, confiando en la
carpeta, se le ofrecerá instalar el plugin.

También puedes pedírselo a Claude dentro del proyecto («que todo el equipo use
docs-skills»): la skill [`adoptar-estructura-de-docs`](../skills/adoptar-estructura-de-docs/)
hace estos dos pasos, pregunta cuántas personas trabajan y deja configurados los roles del
ciclo (quién aprueba el plan, quién verifica, quién archiva). Los roles se explican en el
[ADR 0011](decisions/0011-roles-y-dueno-en-el-ciclo-sdd.md).

### Sin acceso a GitHub

Si el equipo no puede descargar de GitHub, copia docs-skills dentro del proyecto desde un
clon:

```powershell
.\scripts\install.ps1 -Project ..\mi-proyecto        # en bash: ./scripts/install.sh --project ../mi-proyecto
```

Queda todo en `mi-proyecto/.claude/`, con los comandos sin prefijo, y la versión copiada en
`.claude/docs-skills.version`. Versiona esa carpeta en el proyecto. Para actualizar, se
vuelve a ejecutar el script.

## Publicar una mejora

Quien instaló el plugin **no recibe los cambios hasta que sube el número de versión**,
aunque hagas push. Para publicar:

1. Haz el cambio en el repositorio.
2. Sube `version` en [`.claude-plugin/plugin.json`](../.claude-plugin/plugin.json):

   | Tipo de cambio | Ejemplo |
   |---|---|
   | Corrección | `0.1.0` → `0.1.1` |
   | Skill, comando o agente nuevo | `0.1.0` → `0.2.0` |
   | Renombrar o quitar una skill, un comando o un agente | `0.1.0` → `1.0.0` |

3. Añade una entrada en [`CHANGELOG.md`](../CHANGELOG.md) con lo que cambió.
4. Comprueba que el plugin sigue siendo válido:

   ```bash
   claude plugin validate .
   ```

   El único aviso esperado es el del `CLAUDE.md` de la raíz.
5. Haz commit y push a `main`.

## Recibir las mejoras

Cada persona que tiene el plugin elige una de estas dos formas:

- **A mano**, cuando quiera: `/plugin marketplace update docs-skills`.
- **Automático**, activándolo una sola vez: `/plugin` → **Marketplaces** → `docs-skills` →
  **Enable auto-update**.

## Resolución de problemas

### La instalación falla con un error de git o de SSH

**Problema:** `/plugin install` no puede descargar el repositorio. Suele pasar cuando la
computadora no tiene una clave SSH configurada en GitHub.

**Solución:** pide a Claude Code que descargue por HTTPS, que en un repositorio público no
pide nada. Ejecuta esto en la terminal y abre Claude Code desde esa misma terminal:

```powershell
$env:CLAUDE_CODE_PLUGIN_PREFER_HTTPS = "1"    # Windows (PowerShell)
```

```bash
export CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1      # macOS / Linux
```

### Cada skill aparece dos veces

**Problema:** en la lista de skills o comandos hay duplicados, con y sin `docs-skills:`.

**Solución:** hay dos vías instaladas a la vez. Desinstala el plugin
(`claude plugin uninstall docs-skills@docs-skills`) o quita los enlaces de
`~/.claude/skills`, `~/.claude/commands` y `~/.claude/agents` que apuntan al clon.

### Hice push pero mi compañero no ve el cambio

**Problema:** el cambio está en GitHub pero no le llega a quien tiene el plugin.

**Solución:** revisa que subiste `version` en `.claude-plugin/plugin.json`. Si la subiste,
tu compañero tiene que actualizar (`/plugin marketplace update docs-skills`) o tener
activada la actualización automática.

### No aparecen los comandos `/sdd-*`

**Problema:** las skills funcionan pero los comandos no.

**Solución:** si usas docs-skills por el servidor MCP, es lo esperado: el MCP solo sirve
skills. Instala el plugin. Si ya lo tienes, busca los comandos con el prefijo:
`/docs-skills:sdd-new`.

## Relacionado

- [`README.md`](../README.md#instalación): las tres vías de instalación.
- [ADR 0010](decisions/0010-distribuir-como-plugin-y-copia-por-proyecto.md): por qué se
  distribuye como plugin.
- [ADR 0011](decisions/0011-roles-y-dueno-en-el-ciclo-sdd.md): roles para dos personas o
  un equipo.
