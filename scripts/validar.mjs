#!/usr/bin/env node
// Nivel 1 de la verificación: estructura de skills, comandos, agentes y manifiesto.
//
// Recorre el repositorio, aplica las reglas de `lib/lint.mjs` e imprime un
// informe. Sale con código 1 si hay algún error; los avisos no bloquean.
//
//   node scripts/validar.mjs
//
// Ver evals/README.md para los otros dos niveles.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { faltanEnReadme, lintAgente, lintComando, lintSkill, lintVersion } from './lib/lint.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const leer = (...ruta) => readFileSync(join(RAIZ, ...ruta), 'utf8');
const leerSiExiste = (...ruta) => (existsSync(join(RAIZ, ...ruta)) ? leer(...ruta) : null);

let errores = 0;
let avisos = 0;

function informar(etiqueta, resultado) {
  errores += resultado.errores.length;
  avisos += resultado.avisos.length;
  if (resultado.errores.length === 0 && resultado.avisos.length === 0) {
    console.log(`  ✓  ${etiqueta}`);
    return;
  }
  console.log(`${resultado.errores.length > 0 ? '  ✗ ' : '  ⚠ '} ${etiqueta}`);
  for (const m of resultado.errores) console.log(`       ERROR: ${m}`);
  for (const m of resultado.avisos) console.log(`       AVISO: ${m}`);
}

function markdownDe(carpeta) {
  const ruta = join(RAIZ, carpeta);
  if (!existsSync(ruta)) return [];
  return readdirSync(ruta).filter((f) => f.endsWith('.md') && !/^readme\.md$/i.test(f)).sort();
}

function main() {
  // ── Skills ─────────────────────────────────────────────────────────────────
  const dirSkills = join(RAIZ, 'skills');
  const carpetas = readdirSync(dirSkills).filter((d) => statSync(join(dirSkills, d)).isDirectory()).sort();
  const conocidas = new Set(carpetas);

  console.log('Skills');
  for (const carpeta of carpetas) {
    const base = join(dirSkills, carpeta);
    if (!existsSync(join(base, 'SKILL.md'))) {
      informar(carpeta, { errores: ['falta SKILL.md'], avisos: [] });
      continue;
    }
    const resultado = lintSkill(carpeta, readFileSync(join(base, 'SKILL.md'), 'utf8'), {
      existe: (rel) => existsSync(join(base, rel)),
      skillsConocidas: conocidas,
    });

    // Material de terceros: la licencia exige conservar los dos archivos juntos.
    const licencia = existsSync(join(base, 'LICENSE'));
    const aviso = existsSync(join(base, 'NOTICE'));
    if (licencia !== aviso) {
      resultado.errores.push(`tiene ${licencia ? 'LICENSE' : 'NOTICE'} sin ${licencia ? 'NOTICE' : 'LICENSE'}: el material vendorizado conserva los dos`);
    }

    for (const sub of readdirSync(base)) {
      const ruta = join(base, sub);
      if (statSync(ruta).isDirectory() && readdirSync(ruta).length === 0) {
        resultado.avisos.push(`la subcarpeta ${sub}/ está vacía`);
      }
    }
    informar(carpeta, resultado);
  }

  // ── Comandos y agentes ─────────────────────────────────────────────────────
  const comandos = markdownDe('commands');
  console.log('\nComandos');
  for (const f of comandos) informar(`commands/${f}`, lintComando(f, leer('commands', f)));

  const agentes = markdownDe('agents');
  console.log('\nAgentes');
  for (const f of agentes) informar(`agents/${f}`, lintAgente(f, leer('agents', f)));

  // ── Repositorio ────────────────────────────────────────────────────────────
  console.log('\nRepositorio');
  informar('plugin.json ↔ CHANGELOG.md', {
    errores: lintVersion(
      leer('.claude-plugin', 'plugin.json'),
      leerSiExiste('.claude-plugin', 'marketplace.json'),
      leer('CHANGELOG.md'),
    ),
    avisos: [],
  });

  const nombresComando = comandos.map((f) => f.replace(/\.md$/, ''));
  informar('tablas del README.md', {
    errores: [],
    avisos: faltanEnReadme(leer('README.md'), carpetas, nombresComando).map((x) => `falta ${x}`),
  });

  // Ningún manifiesto de dependencias fuera de mcp/ (ADR 0012, Confirmation).
  const manifiestos = ['package.json', 'scripts/package.json', 'evals/package.json'].filter((r) => existsSync(join(RAIZ, r)));
  informar('sin dependencias fuera de mcp/ (ADR 0012)', {
    errores: manifiestos.map((r) => `${r} no debe existir: solo mcp/ tiene dependencias`),
    avisos: [],
  });

  const estado = errores > 0 ? 'FALLA' : avisos > 0 ? 'PASA CON AVISOS' : 'PASA';
  console.log(
    `\n${carpetas.length} skills, ${comandos.length} comandos y ${agentes.length} agentes — ` +
      `${errores} error(es), ${avisos} aviso(s) — ${estado}`,
  );
  if (errores > 0) process.exitCode = 1;
}

try {
  main();
} catch (e) {
  console.error(`ERROR: validar.mjs falló de forma inesperada: ${e.message}`);
  process.exitCode = 1;
}
