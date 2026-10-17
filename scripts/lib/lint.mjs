// Reglas de validación de skills, comandos y agentes.
//
// Funciones puras: reciben el texto ya leído y, cuando hace falta saber si un
// archivo existe, una función `existe(rutaRelativa)`. Así se prueban sin tocar
// el disco. La CLI que recorre el repositorio es `scripts/validar.mjs`.
//
// El frontmatter se parte con el mismo código que usa el servidor MCP
// (`mcp/src/skills.js`): si el lint y el servidor leyeran distinto, el lint
// podría dar por buena una skill que por MCP llega vacía.

import { partirFrontmatter, leerFrontmatter } from '../../mcp/src/skills.js';

/**
 * Claves de primer nivel admitidas en un SKILL.md: las de la especificación de
 * skills más las que Claude Code añade, que es donde se publica este plugin.
 * Una clave fuera de esta lista suele ser una errata, y Claude Code la ignora
 * sin avisar.
 */
export const CLAVES_SKILL = new Set([
  // Especificación de Agent Skills
  'name',
  'description',
  'license',
  'compatibility',
  'metadata',
  'allowed-tools',
  // Extensiones de Claude Code
  'argument-hint',
  'disable-model-invocation',
  'user-invocable',
  'model',
  'context',
  'agent',
  'hooks',
]);

// Archivos de licencia que una skill vendorizada enlaza sin que deban ir en references/.
const ARCHIVOS_DE_LICENCIA = new Set(['LICENSE', 'NOTICE']);

/** Claves que Claude Code reconoce en un comando de barra. `name` no es una de ellas. */
export const CLAVES_COMANDO = new Set([
  'description',
  'argument-hint',
  'allowed-tools',
  'model',
  'disable-model-invocation',
]);

export const MAX_NAME = 64;
export const MAX_DESCRIPTION = 1024;

// El SKILL.md se carga entero cada vez que la skill se activa. Es un aviso y no
// un error: recortar es una decisión editorial y no debe bloquear otro cambio.
export const MAX_LINEAS = 500;

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Una description debe decir cuándo usar la skill y cuándo no, para no
// competir con otra (CLAUDE.md, «El `description` del frontmatter es el
// disparador»). Se compara sin tildes, así que «Úsala» llega como «usala».
const DISPARADOR = /\b(usala|usalo|usa esta skill|aplicala|use when|use before|use after|use for|trigger)\b/;
const EXCLUSION = /\b(no la uses|no lo uses|no usar|no aplica|do not use|don't use|not for)\b/;

// En YAML, un valor sin comillas no puede empezar por estos caracteres.
const INICIO_RESERVADO = /^[[\]{}*&!|>%@`,?]/;

// Skills que no son de este repositorio pero que el contenido puede nombrar.
const SKILLS_EXTERNAS = new Set(['claude-api', 'skill-creator']);

// Formas en que el contenido nombra otra skill. Solo estas cuentan: un nombre
// suelto entre comillas invertidas puede ser cualquier identificador.
const PATRONES_REFERENCIA = [
  /\bskills? `([a-z0-9]+(?:-[a-z0-9]+)+)`/g,
  /`([a-z0-9]+(?:-[a-z0-9]+)+)` skill\b/g,
  /\beso es `([a-z0-9]+(?:-[a-z0-9]+)+)`/g,
  /\b[Uu]sa `([a-z0-9]+(?:-[a-z0-9]+)+)`/g,
  /\buse the `([a-z0-9]+(?:-[a-z0-9]+)+)` skill/g,
];

// ─── Utilidades ──────────────────────────────────────────────────────────────

/** Quita tildes y pasa a minúsculas. */
export function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Sustituye los bloques de código cercados por líneas vacías.
 *
 * Sigue las reglas de CommonMark para que un enlace o un nombre dentro de un
 * ejemplo no cuente: valen ``` y ~~~, con hasta tres espacios de sangría, y el
 * bloque solo se cierra con una marca igual y al menos tan larga. Un bloque sin
 * cerrar llega hasta el final del archivo. Se conserva el número de líneas.
 */
export function quitarBloquesDeCodigo(texto) {
  const lineas = texto.split('\n');
  let abierto = null;
  return lineas
    .map((linea) => {
      const marca = /^ {0,3}(`{3,}|~{3,})/.exec(linea);
      if (!abierto) {
        if (marca) {
          abierto = marca[1];
          return '';
        }
        return linea;
      }
      if (marca && marca[1][0] === abierto[0] && marca[1].length >= abierto.length && linea.trim() === marca[1]) {
        abierto = null;
      }
      return '';
    })
    .join('\n');
}

/**
 * Revisa el frontmatter tal como está escrito, antes de interpretarlo.
 *
 * Es donde se esconden los fallos que Claude Code no avisa: un valor sin
 * comillas con `: ` rompe el YAML y uno con ` #` se corta en el comentario, y
 * en los dos casos la skill aparece sin description. Un valor multilínea (`>`,
 * `|`) sí lo lee Claude Code, pero el parser del servidor MCP lo deja vacío.
 *
 * @param {string} datos  Texto entre las dos líneas `---`.
 * @param {Set<string>} clavesPermitidas
 * @param {string[]} unaLinea  Claves que deben ir en una sola línea.
 */
export function revisarFrontmatter(datos, clavesPermitidas, unaLinea = ['name', 'description']) {
  const errores = [];
  const lineas = datos.split(/\r?\n/);
  let claveActual = null;

  for (const linea of lineas) {
    if (linea.trim() === '' || linea.trimStart().startsWith('#')) continue;

    const clave = /^([A-Za-z0-9_-]+):(?:[ \t]+(.*)|[ \t]*)$/.exec(linea);
    if (!clave) {
      if (/^\s/.test(linea) && claveActual) {
        if (unaLinea.includes(claveActual)) {
          errores.push(`\`${claveActual}\` ocupa varias líneas: el servidor MCP solo lee la primera`);
          unaLinea = unaLinea.filter((c) => c !== claveActual);
        }
        continue;
      }
      errores.push(`línea de frontmatter que no es una clave: «${linea.trim()}»`);
      continue;
    }

    const [, nombre, valorCrudo = ''] = clave;
    claveActual = nombre;
    if (clavesPermitidas && !clavesPermitidas.has(nombre)) {
      errores.push(`clave \`${nombre}\` no admitida en el frontmatter (admitidas: ${[...clavesPermitidas].join(', ')})`);
    }
    if (!unaLinea.includes(nombre)) continue;

    const valor = valorCrudo.trim();
    if (valor === '') continue; // un valor vacío lo informa quien lo necesita
    if (valor === '>' || valor === '|' || /^[>|][+-]?\d*$/.test(valor)) {
      errores.push(`\`${nombre}\` usa un bloque multilínea (${valor}): el servidor MCP lo recibe vacío`);
      continue;
    }
    errores.push(...revisarEscalar(nombre, valor));
  }
  return errores;
}

/** Comprueba que un valor de una línea sea un escalar YAML válido y no se corte. */
export function revisarEscalar(nombre, valor) {
  if (valor.startsWith("'")) {
    if (valor.length < 2 || !valor.endsWith("'")) return [`\`${nombre}\` abre comilla simple y no la cierra`];
    const dentro = valor.slice(1, -1).replaceAll("''", '');
    if (dentro.includes("'")) return [`\`${nombre}\` tiene un apóstrofo sin duplicar dentro de comillas simples (usa '')`];
    return [];
  }
  if (valor.startsWith('"')) {
    if (valor.length < 2 || !valor.endsWith('"') || valor.endsWith('\\"')) {
      return [`\`${nombre}\` abre comilla doble y no la cierra`];
    }
    const dentro = valor.slice(1, -1).replace(/\\./g, '');
    if (dentro.includes('"')) return [`\`${nombre}\` tiene una comilla doble sin escapar`];
    return [];
  }
  const errores = [];
  if (valor.includes(': ') || valor.endsWith(':')) {
    errores.push(`\`${nombre}\` sin comillas contiene «: »: Claude Code descarta el valor en silencio. Ponlo entre comillas simples`);
  }
  if (/\s#/.test(valor)) {
    errores.push(`\`${nombre}\` sin comillas contiene « #»: YAML corta el valor ahí. Ponlo entre comillas simples`);
  }
  if (INICIO_RESERVADO.test(valor)) {
    errores.push(`\`${nombre}\` sin comillas empieza por «${valor[0]}», reservado en YAML. Ponlo entre comillas simples`);
  }
  return errores;
}

/**
 * Enlaces relativos del cuerpo, sin anclas ni URLs externas.
 * Ignora el código cercado y el código en línea, que suelen ser plantillas.
 */
export function enlacesRelativos(cuerpo) {
  const limpio = quitarBloquesDeCodigo(cuerpo).replace(/`[^`\n]*`/g, '');
  const enlaces = [];
  for (const m of limpio.matchAll(/\[[^\]\n]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const destino = m[1].replace(/^<|>$/g, '');
    if (/^[a-z][a-z0-9+.-]*:/i.test(destino) || destino.startsWith('#')) continue;
    const ruta = decodeURIComponent(destino.split('#')[0]);
    if (ruta) enlaces.push(ruta);
  }
  return enlaces;
}

/** Normaliza `a/./b/../c` a `a/c`. Devuelve null si la ruta sale de la base. */
export function resolverRelativa(ruta) {
  const partes = [];
  for (const parte of ruta.replace(/\\/g, '/').split('/')) {
    if (parte === '' || parte === '.') continue;
    if (parte === '..') {
      if (partes.length === 0) return null;
      partes.pop();
    } else partes.push(parte);
  }
  return partes.join('/');
}

/** Nombres de skill que el cuerpo menciona de forma explícita. */
export function referenciasASkills(cuerpo) {
  const limpio = quitarBloquesDeCodigo(cuerpo);
  const nombres = new Set();
  for (const patron of PATRONES_REFERENCIA) {
    for (const m of limpio.matchAll(patron)) nombres.add(m[1]);
  }
  return nombres;
}

// ─── Skills ──────────────────────────────────────────────────────────────────

/**
 * Valida un SKILL.md.
 *
 * @param {string} carpeta  Nombre de la carpeta de la skill.
 * @param {string} texto    Contenido del SKILL.md.
 * @param {object} opciones
 * @param {(rel: string) => boolean} [opciones.existe]  ¿Existe esta ruta, relativa a la carpeta de la skill?
 * @param {Set<string>} [opciones.skillsConocidas]
 */
export function lintSkill(carpeta, texto, { existe = () => true, skillsConocidas } = {}) {
  const errores = [];
  const avisos = [];

  if (!KEBAB.test(carpeta)) errores.push(`el nombre de carpeta «${carpeta}» no está en kebab-case`);

  const { datos, cuerpo } = partirFrontmatter(texto);
  if (datos === null) {
    errores.push('falta el frontmatter (--- … ---) al principio del archivo');
    return { errores, avisos };
  }

  errores.push(...revisarFrontmatter(datos, CLAVES_SKILL));
  const { name, description } = leerFrontmatter(datos);

  if (!name) errores.push('falta `name` en el frontmatter');
  else {
    if (name !== carpeta) errores.push(`\`name\` (${name}) no coincide con la carpeta (${carpeta})`);
    if (name.length > MAX_NAME) errores.push(`\`name\` tiene ${name.length} caracteres (máximo ${MAX_NAME})`);
    if (name.includes('--')) errores.push('`name` no puede contener «--»');
  }

  if (!description) errores.push('falta `description` en el frontmatter, o está vacía');
  else {
    if (description.length > MAX_DESCRIPTION) {
      errores.push(`\`description\` tiene ${description.length} caracteres (máximo ${MAX_DESCRIPTION})`);
    }
    const desc = normalizar(description);
    if (!DISPARADOR.test(desc)) avisos.push('la `description` no dice cuándo usarla («Úsala cuando…», «Use when…»)');
    if (!EXCLUSION.test(desc)) avisos.push('la `description` no dice cuándo NO usarla («No la uses…»), y puede competir con otra skill');
  }

  const lineas = texto.split('\n').length;
  if (lineas > MAX_LINEAS) avisos.push(`SKILL.md tiene ${lineas} líneas (presupuesto: ${MAX_LINEAS}); mueve secciones a references/`);

  for (const enlace of enlacesRelativos(cuerpo)) {
    const ruta = resolverRelativa(enlace);
    if (ruta === null) {
      avisos.push(`el enlace «${enlace}» sale de la carpeta de la skill: no llega por MCP ni con la skill instalada sola`);
      continue;
    }
    if (!existe(ruta)) {
      errores.push(`enlace roto: «${enlace}»`);
      continue;
    }
    if (ruta !== 'SKILL.md' && !ARCHIVOS_DE_LICENCIA.has(ruta) && !ruta.startsWith('references/')) {
      avisos.push(`«${enlace}» está fuera de references/: el servidor MCP no lo sirve`);
    }
  }

  if (skillsConocidas) {
    for (const ref of referenciasASkills(cuerpo)) {
      if (ref !== carpeta && !skillsConocidas.has(ref) && !SKILLS_EXTERNAS.has(ref)) {
        avisos.push(`menciona la skill \`${ref}\`, que no existe en skills/`);
      }
    }
  }

  return { errores, avisos };
}

// ─── Comandos y agentes ──────────────────────────────────────────────────────

/** Valida un `commands/<nombre>.md`. */
export function lintComando(archivo, texto) {
  const errores = [];
  const avisos = [];
  const { datos, cuerpo } = partirFrontmatter(texto);
  if (datos === null) return { errores: ['falta el frontmatter'], avisos };

  errores.push(...revisarFrontmatter(datos, CLAVES_COMANDO, ['description', 'argument-hint']));
  const { description } = leerFrontmatter(datos);
  if (!description) errores.push('falta `description` en el frontmatter');
  if (/^name:/m.test(datos)) errores.push('un comando no lleva `name`: es un campo de skill');

  const usaArgumentos = /\$ARGUMENTS|\$\d/.test(cuerpo);
  const tieneHint = /^argument-hint:[ \t]*\S/m.test(datos);
  if (usaArgumentos && !tieneHint) errores.push('el cuerpo usa $ARGUMENTS pero falta `argument-hint`');
  if (tieneHint && !usaArgumentos) avisos.push('declara `argument-hint` pero el cuerpo no usa $ARGUMENTS');

  if (!/^[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(archivo)) errores.push(`el nombre «${archivo}» no está en kebab-case`);
  return { errores, avisos };
}

/** Valida un `agents/<nombre>.md`. */
export function lintAgente(archivo, texto) {
  const errores = [];
  const { datos } = partirFrontmatter(texto);
  if (datos === null) return { errores: ['falta el frontmatter'], avisos: [] };

  errores.push(...revisarFrontmatter(datos, null));
  const { name, description } = leerFrontmatter(datos);
  const esperado = archivo.replace(/\.md$/, '');
  if (!name) errores.push('falta `name` en el frontmatter');
  else if (name !== esperado) errores.push(`\`name\` (${name}) no coincide con el archivo (${esperado})`);
  if (!description) errores.push('falta `description` en el frontmatter');
  return { errores, avisos: [] };
}

// ─── Repositorio ─────────────────────────────────────────────────────────────

/**
 * La versión del manifiesto tiene su entrada en el CHANGELOG.
 * Sin ella, quien instaló el plugin no sabe qué recibe al actualizar.
 */
export function lintVersion(pluginJson, marketplaceJson, changelog) {
  const errores = [];
  let plugin;
  try {
    plugin = JSON.parse(pluginJson);
  } catch (e) {
    return [`.claude-plugin/plugin.json no es JSON válido: ${e.message}`];
  }
  if (!/^\d+\.\d+\.\d+$/.test(plugin.version ?? '')) {
    errores.push(`plugin.json: \`version\` «${plugin.version}» no es semver`);
  } else {
    const escapada = plugin.version.replace(/\./g, '\\.');
    if (!new RegExp(`^## ${escapada}\\b`, 'm').test(changelog)) {
      errores.push(`CHANGELOG.md no tiene la entrada «## ${plugin.version}» de la versión de plugin.json`);
    }
  }
  if (marketplaceJson) {
    try {
      const mercado = JSON.parse(marketplaceJson);
      if (!mercado.plugins?.some((p) => p.name === plugin.name)) {
        errores.push(`marketplace.json no lista el plugin «${plugin.name}»`);
      }
    } catch (e) {
      errores.push(`.claude-plugin/marketplace.json no es JSON válido: ${e.message}`);
    }
  }
  return errores;
}

/** Skills y comandos que faltan en las tablas del README. */
export function faltanEnReadme(readme, skills, comandos) {
  const faltan = [];
  for (const s of skills) if (!readme.includes(`skills/${s}/`)) faltan.push(`skill \`${s}\``);
  for (const c of comandos) if (!readme.includes(`commands/${c}.md`)) faltan.push(`comando \`/${c}\``);
  return faltan;
}
