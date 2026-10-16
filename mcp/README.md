# Servidor MCP de las skills

Expone las skills de `../skills/` por MCP, para consumirlas desde cualquier cliente
—Claude Code, Claude Desktop u otro— sin instalarlas en `~/.claude/skills`.

Es la alternativa a `scripts/install.ps1`: aquel enlaza las carpetas y el cliente las
carga solas; este las sirve bajo demanda y permite que el modelo busque entre ellas.

## Tools

| Tool | Qué hace |
|---|---|
| `listar_skills` | Todas las skills con su `description` y sus archivos de referencia |
| `buscar_skills` | Busca en nombre, descripción y cuerpo; devuelve fragmentos, no skills enteras |
| `leer_skill` | El `SKILL.md`, o un archivo de `references/` si se pide por nombre |

El reparto es deliberado: buscar devuelve **dónde mirar** y leer trae el contenido. Si
la búsqueda devolviera las skills completas, tres consultas llenarían el contexto con
material que no se va a usar — que es justo lo que este repositorio evita al separar
`SKILL.md` de `references/`.

## Uso local

```bash
cd mcp
npm install
```

Registrarlo en Claude Code:

```bash
claude mcp add docs-skills -- node C:/Users/Kevin/Documents/AGENTS/docs-skills/mcp/src/stdio.js
```

Con `SKILLS_DIR` se apunta a otra carpeta de skills, por si el servidor vive separado
del repositorio:

```bash
claude mcp add docs-skills --env SKILLS_DIR=/ruta/a/skills -- node /ruta/a/mcp/src/stdio.js
```

Las skills se leen **al arrancar**. Si editas un `SKILL.md`, reinicia el servidor
(`/mcp` en Claude Code) para que el cambio se vea.

## Adoptar en otro proyecto

Para usar las skills desde otro proyecto sin instalarlas en él, registra el servidor con
alcance de usuario, de modo que esté disponible en todos tus proyectos y no solo en el
actual:

```bash
claude mcp add docs-skills -s user -- node C:/Users/Kevin/Documents/AGENTS/docs-skills/mcp/src/stdio.js
```

**Por MCP las skills no se activan solas.** Claude Code carga por `description` solo las
skills instaladas en `~/.claude/skills`; por MCP, el modelo tiene que llamar a
`buscar_skills` o `leer_skill`, y no lo hará si nada se lo sugiere. Por eso el proyecto
que las consuma necesita un aviso corto en su `CLAUDE.md`. La skill
[`adoptar-estructura-de-docs`](../skills/adoptar-estructura-de-docs/SKILL.md) lo deja
puesto junto con la carpeta `docs/decisions/`.

Solo funciona en la máquina donde está el repositorio: el servidor es local. Para
otras máquinas hace falta la variante remota, que sigue pendiente.

## Estructura

| Archivo | Qué es |
|---|---|
| `src/skills.js` | Parseo del frontmatter y búsqueda. No sabe nada de MCP ni de disco |
| `src/servidor.js` | Las tres tools, sobre skills ya cargadas en memoria |
| `src/cargar-disco.js` | Lectura desde el sistema de archivos. Solo para la variante local |
| `src/stdio.js` | Punto de entrada local |

La separación existe por el despliegue remoto: un Worker de Cloudflare no tiene
sistema de archivos, así que `cargar-disco.js` es el único archivo que no puede viajar
allí. `skills.js` y `servidor.js` sí, sin tocarlos.

## Desplegar en Cloudflare (pendiente)

La propuesta completa está en [`docs/specs/worker-cloudflare.md`](../docs/specs/worker-cloudflare.md).

Es posible: Workers sirve servidores MCP remotos por HTTP y Claude Code se conecta con
`claude mcp add --transport http <nombre> <url>`. Lo que falta por montar:

1. Un script de build que vuelque las skills a un JSON embebido en el bundle —no hay
   disco que leer en tiempo de ejecución— y el `wrangler.toml`.
2. Un entrypoint que sirva el transporte HTTP reutilizando `crearServidor()`.
3. Decidir el control de acceso. Un MCP remoto sin autenticación es público: aquí el
   contenido son skills de un repositorio propio, así que el riesgo es bajo, pero
   conviene decidirlo a conciencia y no por omisión.

Mientras tanto, la vía local no depende de nada de esto.

## Regla al tocar el servidor

**Nada escribe en stdout salvo el transporte.** En stdio, stdout es el canal JSON-RPC:
un `console.log` de depuración rompe la conexión y el error que ve el cliente no
menciona el log. Para depurar, `console.error`.
