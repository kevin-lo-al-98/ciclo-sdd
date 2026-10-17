// Ranking léxico de skills por su `description`.
//
// Es una aproximación al ruteo real: TF-IDF y coseno sobre las palabras de la
// `description`, sin semántica. No predice si Claude carga una skill; detecta
// los dos fallos que más pesan en la práctica: una `description` que no
// contiene las palabras que dice el usuario, y una tan amplia que le gana a la
// skill correcta. Lo semántico lo mide `claude plugin eval` (evals/README.md).
//
// El contenido está en español y las skills vendorizadas en inglés, así que el
// tokenizador conserva las letras con tilde (las normaliza en lugar de
// borrarlas) y lleva palabras vacías y sufijos de los dos idiomas.

const VACIAS = new Set([
  // español
  'al', 'ante', 'con', 'como', 'cual', 'cuando', 'del', 'desde', 'donde', 'el', 'ella', 'en',
  'entre', 'esa', 'esas', 'ese', 'eso', 'esos', 'esta', 'estas', 'este', 'esto', 'estos', 'hay',
  'las', 'les', 'los', 'mas', 'mis', 'muy', 'nos', 'otra', 'otro', 'para', 'pero', 'por',
  'porque', 'que', 'quiero', 'sea', 'ser', 'sin', 'sobre', 'son', 'sus', 'tambien', 'una',
  'unas', 'uno', 'unos', 'aqui', 'asi', 'algo', 'todo', 'toda', 'todos', 'todas', 'necesito',
  'puedes', 'puede', 'ayuda', 'ayudame', 'haz', 'hace', 'hacer', 'tengo', 'tiene', 'tienes',
  'quieres', 'vamos', 'mira', 'dame', 'favor', 'solo', 'cada', 'cosa', 'dice', 'diga', 'pida',
  'pide', 'usuario', 'usala', 'usalo', 'usa', 'uses', 'aplicala',
  // inglés
  'and', 'any', 'are', 'before', 'for', 'from', 'into', 'its', 'need', 'needs', 'our', 'that',
  'the', 'them', 'this', 'use', 'want', 'when', 'with', 'you', 'your', 'help', 'can', 'please',
  'should', 'what', 'how', 'all', 'also', 'not', 'but', 'has', 'have', 'was', 'were', 'will',
  // «skill» no va aquí aunque muchas descriptions digan «usa esta skill»: es lo
  // que distingue a skill-security-scan, y el IDF ya le baja el peso donde se repite.
]);

// Sufijos que se quitan, del más largo al más corto. Agrupa «decisión» con
// «decisiones», «revisar» con «revisión», «conflicts» con «conflict». No es un
// stemmer de verdad: basta con que las variantes habituales caigan juntas.
const SUFIJOS = [
  'amientos', 'imientos', 'amiento', 'imiento', 'aciones', 'iciones', 'uciones', 'ciones',
  'acion', 'icion', 'ucion', 'cion', 'siones', 'sion', 'iones', 'ion', 'mente', 'idades',
  'idad', 'ables', 'ibles', 'able', 'ible', 'istas', 'ista', 'ismos', 'ismo', 'ando', 'iendo',
  'ados', 'idos', 'adas', 'idas', 'ado', 'ido', 'ada', 'ida', 'ally', 'ing', 'ed', 'ar', 'er',
  'ir', 'es', 'as', 'os', 'al',
];

// Frases que abren la exclusión de una description («No la uses para…»).
// Esa frase nombra el terreno de OTRA skill: contarla como vocabulario propio
// haría que la skill compitiera justo por lo que dice que no le toca.
const APERTURA_EXCLUSION = /^(no la uses|no lo uses|no usar|no aplica|tampoco|do not use|don't use|not for)\b/;

/** Quita tildes (también la de la «ñ») y pasa a minúsculas. */
export function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Reduce una palabra a su raíz aproximada. */
export function raiz(palabra) {
  let t = palabra;
  for (const sufijo of SUFIJOS) {
    if (t.length - sufijo.length >= 4 && t.endsWith(sufijo)) {
      t = t.slice(0, -sufijo.length);
      break;
    }
  }
  if (t.length > 4 && t.endsWith('s') && !t.endsWith('ss')) t = t.slice(0, -1);
  if (t.length > 4 && /[aeo]$/.test(t)) t = t.slice(0, -1);
  // La consonante doble que deja -ing/-ed: «committ» → «commit».
  if (t.length > 4 && t.at(-1) === t.at(-2) && !'aeiou'.includes(t.at(-1))) t = t.slice(0, -1);
  if (t.length > 3 && t.endsWith('y')) t = t.slice(0, -1) + 'i';
  return t;
}

/** Palabras con significado, ya reducidas a su raíz. */
export function tokenizar(texto) {
  return normalizar(texto)
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((t) => t.length > 2 && !VACIAS.has(t))
    .map(raiz);
}

/** La description sin las frases de exclusión. */
export function sinExclusiones(description) {
  return description
    .split(/(?<=[.!?])\s+/)
    .filter((frase) => !APERTURA_EXCLUSION.test(normalizar(frase).replace(/^[^a-z]+/, '')))
    .join(' ');
}

function frecuencias(tokens) {
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

/**
 * Construye el corpus: un documento por skill con su nombre (peso doble) y su
 * description sin exclusiones.
 *
 * @param {{name: string, description: string}[]} skills
 */
export function construirCorpus(skills) {
  const docs = new Map();
  for (const s of skills) {
    const nombre = tokenizar(s.name.replace(/-/g, ' '));
    docs.set(s.name, frecuencias([...nombre, ...nombre, ...tokenizar(sinExclusiones(s.description))]));
  }
  const df = new Map();
  for (const tf of docs.values()) for (const t of tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const n = docs.size;
  const idf = (t) => Math.log(1 + n / (1 + (df.get(t) ?? 0)));
  return { docs, idf };
}

function vector(tf, idf) {
  const v = new Map();
  for (const [t, f] of tf) v.set(t, f * idf(t));
  return v;
}

export function coseno(a, b) {
  let punto = 0;
  let na = 0;
  let nb = 0;
  for (const [t, w] of a) {
    na += w * w;
    const wb = b.get(t);
    if (wb) punto += w * wb;
  }
  for (const w of b.values()) nb += w * w;
  return na && nb ? punto / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

/** Skills ordenadas de más a menos parecidas al prompt. */
export function ordenar(prompt, corpus) {
  const vp = vector(frecuencias(tokenizar(prompt)), corpus.idf);
  const puntos = [];
  for (const [name, tf] of corpus.docs) puntos.push({ name, puntos: coseno(vp, vector(tf, corpus.idf)) });
  return puntos.sort((a, b) => b.puntos - a.puntos || a.name.localeCompare(b.name));
}

/** Pares de skills cuyas descriptions se parecen al menos `umbral`. */
export function colisiones(corpus, umbral) {
  const nombres = [...corpus.docs.keys()].sort();
  const vectores = new Map(nombres.map((n) => [n, vector(corpus.docs.get(n), corpus.idf)]));
  const pares = [];
  for (let i = 0; i < nombres.length; i++) {
    for (let j = i + 1; j < nombres.length; j++) {
      const sim = coseno(vectores.get(nombres[i]), vectores.get(nombres[j]));
      if (sim >= umbral) pares.push({ a: nombres[i], b: nombres[j], sim });
    }
  }
  return pares.sort((x, y) => y.sim - x.sim);
}
