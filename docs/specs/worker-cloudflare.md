# Spec: Worker de Cloudflare para el servidor MCP de skills

Estado: **diferida** (2026-10-16). Desde el
[ADR 0010](../decisions/0010-distribuir-como-plugin-y-copia-por-proyecto.md), Claude Code
recibe skills, comandos y agentes como plugin, así que este Worker solo serviría a otros
clientes MCP. Se retoma si aparece uno que lo necesite.

Datos verificados el 2026-09-28 contra la
documentación de Cloudflare y el registro de npm; las versiones caducan, vuelve a
comprobarlas al implementar.

## Objetivo

Que las mismas tres tools del servidor local (`listar_skills`, `buscar_skills`,
`leer_skill`) se puedan consumir por HTTP desde un Worker de Cloudflare, con
`claude mcp add --transport http`, sin depender de que el repositorio esté clonado en la
máquina del cliente.

## Lo que la documentación de Cloudflare obliga

- **Transporte: Streamable HTTP.** SSE está deprecado; stdio es solo local. El Worker
  sirve `/mcp`.
- **`createMcpHandler` (paquete `agents`) exige el SDK v2**, `@modelcontextprotocol/server`,
  y recibe una **factoría**, no una instancia: crea un servidor nuevo por petición, sin
  estado. Cloudflare lo dice expresamente: no pasar una instancia global.
- El SDK v2 exige **`zod ^4`**. Hoy `mcp/` usa `@modelcontextprotocol/sdk` 1.31 y `zod` 3.
- Límite de tamaño: **64 MiB sin comprimir**. Las skills pesan ~175 KB de Markdown en 28
  archivos: el bundle no es un problema.
- Plan Free: **10 ms de CPU por petición** y 100.000 peticiones al día. Ver riesgo R2.

## Corrección a lo que dijo el README de `mcp/`

El README afirma que `skills.js` y `servidor.js` viajan al Worker "sin tocarlos". Es cierto
para `skills.js` y **falso para `servidor.js`**: importa `McpServer` del SDK v1, y el
handler de Cloudflare solo acepta el v2. Arreglarlo es el primer paso de esta spec.

## Decisión: una sola versión del SDK para los dos servidores

Migrar **todo** `mcp/` al SDK v2 y zod 4, incluida la variante stdio (el v2 expone
`@modelcontextprotocol/server/stdio`). La alternativa —mantener v1 en local y v2 en el
Worker— obliga a inyectar la clase `McpServer` como parámetro y a mantener dos
superficies de tipos para el mismo código. Un núcleo con dos SDK se desincroniza sin que
nada avise, que es el fallo que esta estructura intentaba evitar.

Pendiente de comprobar en el paso 1: la firma de `registerTool` en v2. El ejemplo de la
documentación coincide con la nuestra (`registerTool(nombre, { description, inputSchema },
handler)`), pero no está verificado que `title` y `isError` se mantengan.

## Diseño

```
mcp/
  scripts/empaquetar-skills.js     lee skills/ y escribe el JSON embebido
  src/
    skills.js                      sin cambios
    servidor.js                    migrado a SDK v2; sigue recibiendo skills en memoria
    cargar-disco.js  stdio.js      local, migrados a SDK v2
    worker/
      index.js                     fetch(): auth + createMcpHandler(() => crearServidor(skills))
      skills.generated.json        generado, NO versionado
  wrangler.jsonc
```

- **`empaquetar-skills.js`** reutiliza `cargarDesdeDisco` (corre en Node, no en el Worker)
  y vuelca el resultado a JSON. **Debe fallar** si alguna skill trae `avisos` (falta
  `description`, o `name` distinto de la carpeta): un aviso que solo se muestra en el
  listado se publica igual, y este es el último punto donde detenerlo.
- **`worker/index.js`** importa el JSON, comprueba la autenticación y delega en
  `createMcpHandler`. El JSON se importa una vez a nivel de módulo: los isolates de
  Workers persisten entre peticiones, así que no se reparsea en cada una.
- **`wrangler.jsonc`**: `main` apunta a `src/worker/index.js`. `compatibility_date` = el
  día del primer despliegue. `nodejs_compat` solo si el paso 1 demuestra que `agents` lo
  necesita; la documentación no lo especifica.
- **Scripts de `package.json`**: `build:worker` (empaquetar), `dev:worker`
  (`wrangler dev`), `deploy:worker` (build + `wrangler deploy`). El deploy **siempre**
  pasa por el build: desplegar sin regenerar publica skills viejas sin ningún error.

## Decisiones abiertas

**D1 — Autenticación (bloqueante).** Un Worker sin auth es público en `workers.dev`.
Recomendación: **token bearer**, guardado con `wrangler secret put SKILLS_TOKEN` y
comprobado en `index.js` antes del handler; el cliente lo envía con
`claude mcp add --transport http ciclo-sdd <url> --header "Authorization: Bearer …"`.
Es lo mínimo que cierra el acceso sin montar OAuth. Sin auth solo es defendible si el
repositorio es público: si es privado, el Worker lo publicaría entero. Y `skill-security-scan`
es material Apache-2.0 de terceros, con `LICENSE` y `NOTICE` que deben acompañarlo.

**D2 — URL.** `*.workers.dev` para empezar. Con dominio propio hay que fijar
`allowedHostnames` y `allowedOriginHostnames`, o el handler rechaza las peticiones.

## Fuera de alcance

OAuth, Durable Objects o servidores con estado, KV y R2 (el contenido va en el bundle,
decisión ya tomada), CI de despliegue, y las primitivas `resources` y `prompts`.

## Pasos

1. **Migración y comprobación (spike).** Pasar `mcp/` al SDK v2 y zod 4; repetir la prueba
   de humo por stdio. Si `registerTool` cambió, se sabe aquí y no con el Worker a medias.
2. Script de empaquetado, con el fallo ante `avisos`.
3. `worker/index.js` y `wrangler.jsonc`; probar con `wrangler dev`.
4. Autenticación (D1).
5. `wrangler deploy` y registro en Claude Code.
6. Actualizar `mcp/README.md` y la sección "Estructura" de `CLAUDE.md`.

## Riesgos

- **R1 — Peer dependencies de `agents`.** `agents@0.24.0` declara `@modelcontextprotocol/server`
  `2.0.0` exacto y `@modelcontextprotocol/sdk` `1.30.0`, mientras npm publica `server` 2.2.0
  y `sdk` 1.31.0. Si no son opcionales, la instalación puede pedir versiones fijadas.
  Resolverlo en el paso 1, con `npm ls` a la vista, no a ciegas.
- **R2 — CPU en el plan Free (10 ms).** `buscar()` normaliza (`NFD` + regex) el cuerpo
  de las 12 skills en cada consulta: ~175 KB de texto por petición. Puede rozar el límite.
  Mitigación: normalizar **una vez** a nivel de módulo o en el empaquetado, no por búsqueda.
  Medirlo en `wrangler dev` antes de dar por bueno el plan Free.
- **R3 — Skills obsoletas.** El JSON es una copia: editar un `SKILL.md` no cambia el
  Worker hasta el siguiente deploy. Es el precio de embeber el contenido; el README debe decirlo.

## Criterio de terminado

- `wrangler dev` responde a `tools/list` con las tres tools y `leer_skill` devuelve el
  `SKILL.md` de `resolver-merge` idéntico al del disco.
- El intento de path traversal en `archivo` devuelve `isError` igual que en local.
- Una petición sin token recibe `401` (D1 resuelta) y con token válido responde.
- La variante stdio sigue pasando la misma prueba de humo tras la migración.
- `claude mcp add --transport http …` conecta y `/mcp` lista el servidor.
