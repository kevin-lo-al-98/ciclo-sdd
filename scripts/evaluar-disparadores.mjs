#!/usr/bin/env node
// Nivel 2 de la verificación: disparadores y ruteo entre skills.
//
// Para cada `evals/cases/<skill>.json`:
//   - cada prompt positivo debe dejar a su skill entre las `top_k` primeras
//     (3 por defecto) al compararlo con todas las descriptions;
//   - cada prompt negativo debe ganarlo su `owner`, otra skill, por delante de
//     esta. Sin `owner`, un negativo pasaría aunque no se pareciera a nada.
// Además comprueba que toda skill tenga su archivo de casos y que no haya dos
// descriptions casi iguales.
//
//   node scripts/evaluar-disparadores.mjs                   # informe
//   node scripts/evaluar-disparadores.mjs --min-rank1 80    # falla si el rank-1 baja del 80 %
//   node scripts/evaluar-disparadores.mjs --prompt "haz el commit"   # ranking de un prompt suelto
//
// Determinista y sin tokens: corre en CI. Ver evals/README.md.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { leerFrontmatter, partirFrontmatter } from '../mcp/src/skills.js';
import { colisiones, construirCorpus, ordenar } from './lib/texto.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR_SKILLS = join(RAIZ, 'skills');
const DIR_CASOS = join(RAIZ, 'evals', 'cases');

const MIN_POSITIVOS = 3;
const MIN_NEGATIVOS = 2;
const TOP_K = 3;

// Similitud coseno entre dos descriptions. Por encima del aviso conviene mirar
// si las exclusiones las separan; por encima del error, dos skills compiten por
// lo mismo y una de las dos sobra o necesita otra description.
const COLISION_AVISO = 0.5;
const COLISION_ERROR = 0.75;

function argumento(nombre) {
  const i = process.argv.indexOf(nombre);
  return i === -1 ? undefined : process.argv[i + 1];
}

function cargarSkills() {
  const skills = [];
  for (const dir of readdirSync(DIR_SKILLS).sort()) {
    const archivo = join(DIR_SKILLS, dir, 'SKILL.md');
    if (!existsSync(archivo)) continue;
    const { name, description } = leerFrontmatter(partirFrontmatter(readFileSync(archivo, 'utf8')).datos);
    // Una skill sin description ya es error del nivel 1; aquí no tiene nada que comparar.
    if (name && description) skills.push({ name, description });
  }
  return skills;
}

function mostrarRanking(ranking, n = 3) {
  return ranking
    .filter((r) => r.puntos > 0)
    .slice(0, n)
    .map((r) => `${r.name} (${r.puntos.toFixed(2)})`)
    .join(', ') || 'ninguna skill comparte vocabulario';
}

function main() {
  const skills = cargarSkills();
  const corpus = construirCorpus(skills);
  const nombres = new Set(skills.map((s) => s.name));

  const suelto = argumento('--prompt');
  if (suelto !== undefined) {
    for (const [i, r] of ordenar(suelto, corpus).slice(0, 8).entries()) {
      console.log(`  ${String(i + 1).padStart(2)}. ${r.name.padEnd(38)} ${r.puntos.toFixed(3)}`);
    }
    return;
  }

  const minRank1 = argumento('--min-rank1') === undefined ? null : Number(argumento('--min-rank1'));
  let errores = 0;
  let avisos = 0;
  let positivos = 0;
  let positivosOk = 0;
  let rank1 = 0;
  let negativos = 0;
  let negativosOk = 0;

  const fallo = (msg, ...detalle) => {
    errores++;
    console.log(`  ✗  ${msg}`);
    for (const d of detalle) console.log(`       ${d}`);
  };

  const archivos = existsSync(DIR_CASOS) ? readdirSync(DIR_CASOS).filter((f) => f.endsWith('.json')).sort() : [];
  console.log(`Disparadores: ${skills.length} skills, ${archivos.length} archivos de casos\n`);

  for (const s of skills) {
    if (!archivos.includes(`${s.name}.json`)) fallo(`${s.name}: falta evals/cases/${s.name}.json`);
  }

  for (const archivo of archivos) {
    const esperado = archivo.replace(/\.json$/, '');
    let caso;
    try {
      caso = JSON.parse(readFileSync(join(DIR_CASOS, archivo), 'utf8'));
    } catch (e) {
      fallo(`${archivo}: JSON inválido — ${e.message}`);
      continue;
    }
    if (caso.skill_name !== esperado) fallo(`${archivo}: skill_name «${caso.skill_name}» no coincide con el nombre del archivo`);
    if (!nombres.has(esperado)) {
      fallo(`${archivo}: no existe skills/${esperado}/ (o no tiene description)`);
      continue;
    }

    const pos = caso.trigger?.positive ?? [];
    const neg = caso.trigger?.negative ?? [];
    if (pos.length < MIN_POSITIVOS) fallo(`${esperado}: ${pos.length} prompts positivos (mínimo ${MIN_POSITIVOS})`);
    if (neg.length < MIN_NEGATIVOS) fallo(`${esperado}: ${neg.length} prompts negativos (mínimo ${MIN_NEGATIVOS})`);

    for (const p of pos) {
      positivos++;
      const k = p.top_k ?? TOP_K;
      const ranking = ordenar(p.prompt, corpus);
      const i = ranking.findIndex((r) => r.name === esperado);
      const puntos = ranking[i]?.puntos ?? 0;
      if (i === 0 && puntos > 0) rank1++;
      if (puntos === 0) {
        fallo(`${esperado}: la description no comparte ninguna palabra con un prompt que debería dispararla`, `«${p.prompt}»`);
      } else if (i >= k) {
        fallo(`${esperado}: prompt positivo en el puesto ${i + 1} (se pide top ${k})`, `«${p.prompt}»`, `top 3: ${mostrarRanking(ranking)}`);
      } else positivosOk++;
    }

    for (const p of neg) {
      negativos++;
      if (!p.owner) {
        fallo(`${esperado}: prompt negativo sin \`owner\``, `«${p.prompt}»`);
        continue;
      }
      if (!nombres.has(p.owner) || p.owner === esperado) {
        fallo(`${esperado}: \`owner\` «${p.owner}» no es otra skill del repositorio`, `«${p.prompt}»`);
        continue;
      }
      const ranking = ordenar(p.prompt, corpus);
      const iEsta = ranking.findIndex((r) => r.name === esperado);
      const iDueno = ranking.findIndex((r) => r.name === p.owner);
      if (ranking[iDueno].puntos === 0) {
        fallo(`${esperado}: el owner ${p.owner} no comparte vocabulario con su prompt negativo`, `«${p.prompt}»`);
      } else if (iEsta < iDueno) {
        fallo(
          `${esperado}: le gana a ${p.owner} un prompt que no le toca (puesto ${iEsta + 1} frente a ${iDueno + 1})`,
          `«${p.prompt}»`,
          `top 3: ${mostrarRanking(ranking)}`,
        );
      } else negativosOk++;
    }
  }

  console.log('\nColisiones entre descriptions');
  const pares = colisiones(corpus, COLISION_AVISO);
  if (pares.length === 0) console.log(`  ✓  ningún par por encima de ${COLISION_AVISO}`);
  for (const { a, b, sim } of pares) {
    if (sim >= COLISION_ERROR) fallo(`${a} ↔ ${b}: similitud ${sim.toFixed(2)} (error desde ${COLISION_ERROR})`);
    else {
      avisos++;
      console.log(`  ⚠  ${a} ↔ ${b}: similitud ${sim.toFixed(2)}`);
    }
  }

  const tasa = positivos ? (100 * rank1) / positivos : 0;
  console.log(
    `\nPositivos: ${positivosOk}/${positivos} en su top-k · rank-1: ${rank1}/${positivos} (${tasa.toFixed(1)} %)` +
      `\nNegativos: ${negativosOk}/${negativos} ganados por su owner`,
  );
  if (minRank1 !== null && tasa < minRank1) {
    fallo(`rank-1 de ${tasa.toFixed(1)} % por debajo del piso de ${minRank1} %`);
  }

  const estado = errores > 0 ? 'FALLA' : avisos > 0 ? 'PASA CON AVISOS' : 'PASA';
  console.log(`${errores} error(es), ${avisos} aviso(s) — ${estado}`);
  if (errores > 0) process.exitCode = 1;
}

try {
  main();
} catch (e) {
  console.error(`ERROR: evaluar-disparadores.mjs falló de forma inesperada: ${e.message}`);
  process.exitCode = 1;
}
