// Lectura de las skills desde el sistema de archivos.
//
// Solo lo usa el servidor local. El Worker de Cloudflare no puede importar este
// archivo —no hay `node:fs` allí— y por eso la lectura vive separada del resto.

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { construirSkill } from './skills.js';

/**
 * Lee `raiz/<skill>/SKILL.md` y sus `references/`.
 *
 * Se relee en cada arranque, no se cachea: el sentido de la variante local es
 * que un cambio en un SKILL.md se vea sin publicar nada.
 *
 * @param {string} raiz Carpeta `skills/` del repositorio.
 */
export async function cargarDesdeDisco(raiz) {
  const entradas = await readdir(raiz, { withFileTypes: true });
  const skills = [];

  for (const entrada of entradas) {
    if (!entrada.isDirectory()) continue;

    let textoSkill;
    try {
      textoSkill = await readFile(join(raiz, entrada.name, 'SKILL.md'), 'utf8');
    } catch {
      // Una carpeta sin SKILL.md no es una skill: se ignora en silencio en
      // lugar de abortar, porque un directorio suelto no debe tumbar el servidor.
      continue;
    }

    const referencias = await leerReferencias(join(raiz, entrada.name), 'references');
    skills.push(construirSkill(entrada.name, textoSkill, referencias));
  }

  return skills.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

/** Lee recursivamente los archivos de una subcarpeta. Devuelve {} si no existe. */
async function leerReferencias(base, subcarpeta) {
  const referencias = {};
  let entradas;
  try {
    entradas = await readdir(join(base, subcarpeta), { withFileTypes: true });
  } catch {
    return referencias;
  }

  for (const entrada of entradas) {
    const relativa = `${subcarpeta}/${entrada.name}`;
    if (entrada.isDirectory()) {
      Object.assign(referencias, await leerReferencias(base, relativa));
    } else {
      referencias[relativa] = await readFile(join(base, relativa), 'utf8');
    }
  }
  return referencias;
}
