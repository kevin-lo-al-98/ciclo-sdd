// Carga y consulta de las skills del repositorio.
//
// Este módulo no sabe nada de MCP a propósito: es la parte que comparten el
// servidor local por stdio y el Worker de Cloudflare. El Worker no tiene sistema
// de archivos, así que allí el contenido llega ya leído desde el bundle; aquí
// solo se define qué es una skill y cómo se busca en ella.

/**
 * @typedef {object} Skill
 * @property {string} nombre        Nombre de la carpeta, igual al `name` del frontmatter.
 * @property {string} descripcion   El `description` del frontmatter: el disparador.
 * @property {string} cuerpo        El SKILL.md sin frontmatter.
 * @property {Record<string, string>} referencias  Ruta relativa → contenido.
 */

/** Separa el frontmatter YAML del cuerpo. Devuelve `null` en `datos` si no hay. */
export function partirFrontmatter(texto) {
  const coincidencia = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(texto);
  if (!coincidencia) return { datos: null, cuerpo: texto };
  return { datos: coincidencia[1], cuerpo: texto.slice(coincidencia[0].length) };
}

/**
 * Lee `name` y `description` del frontmatter.
 *
 * No usamos un parser de YAML completo: el frontmatter de una skill son claves
 * de una línea cada una. Claude Code sí usa uno, así que un valor con «: » va
 * citado, y aquí se deshace la cita igual que lo haría YAML.
 */
export function leerFrontmatter(datos) {
  if (!datos) return {};
  const campo = (clave) => {
    const m = new RegExp(`^${clave}:[ \\t]*(.*)$`, 'm').exec(datos);
    if (!m) return undefined;
    return quitarCita(m[1].trim());
  };
  return { name: campo('name'), description: campo('description') };
}

/** Deshace una cita YAML de una línea: `'…'` con `''` como apóstrofo, o `"…"` con escapes `\`. */
export function quitarCita(valor) {
  if (valor.length >= 2 && valor.startsWith("'") && valor.endsWith("'")) {
    return valor.slice(1, -1).replaceAll("''", "'");
  }
  if (valor.length >= 2 && valor.startsWith('"') && valor.endsWith('"')) {
    return valor.slice(1, -1).replace(/\\(["\\])/g, '$1');
  }
  return valor;
}

/**
 * Construye una skill a partir de los textos ya leídos.
 *
 * `nombreCarpeta` manda sobre el `name` del frontmatter: es lo que el usuario
 * ve en el disco y lo que usará para pedirla. Si los dos no coinciden, la skill
 * se devuelve igual con un aviso, porque el repositorio exige que coincidan y
 * callarlo escondería justo el error que hay que corregir.
 */
export function construirSkill(nombreCarpeta, textoSkill, referencias = {}) {
  const { datos, cuerpo } = partirFrontmatter(textoSkill);
  const { name, description } = leerFrontmatter(datos);
  const avisos = [];
  if (!description) avisos.push('sin `description` en el frontmatter');
  if (name && name !== nombreCarpeta) {
    avisos.push(`el \`name\` del frontmatter (${name}) no coincide con la carpeta`);
  }
  return {
    nombre: nombreCarpeta,
    descripcion: description ?? '',
    cuerpo,
    referencias,
    avisos,
  };
}

/** Normaliza para buscar sin acentos ni mayúsculas: "migración" encuentra "migracion". */
function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/**
 * Busca `consulta` en las skills y devuelve las coincidencias ordenadas.
 *
 * Pesa más una coincidencia en el nombre o en la `description` que en el cuerpo,
 * porque la `description` es el disparador: si la consulta se parece a ella, esa
 * es la skill que el usuario quiere, aunque otra la mencione de pasada veinte
 * veces.
 */
export function buscar(skills, consulta, limite = 5) {
  const terminos = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (terminos.length === 0) return [];

  const resultados = [];
  for (const skill of skills) {
    const nombre = normalizar(skill.nombre);
    const descripcion = normalizar(skill.descripcion);
    const cuerpo = normalizar(skill.cuerpo);

    let puntos = 0;
    const encontrados = [];
    for (const termino of terminos) {
      if (nombre.includes(termino)) puntos += 10;
      if (descripcion.includes(termino)) puntos += 5;
      const enCuerpo = contar(cuerpo, termino);
      if (enCuerpo > 0) {
        puntos += Math.min(enCuerpo, 5);
        encontrados.push(termino);
      }
    }
    if (puntos === 0) continue;
    resultados.push({ skill, puntos, fragmento: extraerFragmento(skill.cuerpo, encontrados[0]) });
  }

  return resultados.sort((a, b) => b.puntos - a.puntos).slice(0, limite);
}

function contar(texto, termino) {
  let n = 0;
  let desde = 0;
  for (;;) {
    const i = texto.indexOf(termino, desde);
    if (i === -1) return n;
    n += 1;
    desde = i + termino.length;
  }
}

/** Un par de líneas alrededor de la primera coincidencia, para no devolver la skill entera. */
function extraerFragmento(cuerpo, termino) {
  if (!termino) return '';
  const i = normalizar(cuerpo).indexOf(termino);
  if (i === -1) return '';
  const inicio = Math.max(0, cuerpo.lastIndexOf('\n', Math.max(0, i - 160)) + 1);
  const fin = cuerpo.indexOf('\n', i + 160);
  return cuerpo.slice(inicio, fin === -1 ? cuerpo.length : fin).trim();
}

/**
 * Valida la ruta de un archivo de referencia contra la propia skill.
 *
 * El nombre del archivo llega desde el modelo, así que se comprueba contra la
 * lista real de referencias en lugar de componer una ruta con él: es lo que
 * impide que un `../../.ssh/id_rsa` se convierta en una lectura de disco.
 */
export function resolverReferencia(skill, archivo) {
  const pedido = archivo.replace(/^\.\//, '').replace(/\\/g, '/');
  const candidatos = [pedido, `references/${pedido}`];
  for (const candidato of candidatos) {
    if (Object.hasOwn(skill.referencias, candidato)) {
      return { ruta: candidato, contenido: skill.referencias[candidato] };
    }
  }
  return null;
}
