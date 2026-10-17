// Tests del ranking léxico. Correr con: node --test "scripts/lib/*.test.mjs"

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { colisiones, construirCorpus, ordenar, raiz, sinExclusiones, tokenizar } from './texto.mjs';

test('las tildes no parten una palabra (el fallo del tokenizador original)', () => {
  assert.deepEqual(tokenizar('decisión'), tokenizar('decision'));
  assert.equal(tokenizar('migración').length, 1);
  assert.deepEqual(tokenizar('año'), tokenizar('ano'));
});

test('singular y plural caen en la misma raíz', () => {
  assert.equal(raiz('decisiones'), raiz('decision'));
  assert.equal(raiz('ramas'), raiz('rama'));
  assert.equal(raiz('conflictos'), raiz('conflicto'));
  assert.equal(raiz('conflicts'), raiz('conflict'));
});

test('verbo y sustantivo cercanos caen juntos', () => {
  assert.equal(raiz('revisar'), raiz('revision'));
  assert.equal(raiz('documentar'), raiz('documentacion'));
  assert.equal(raiz('committing'), raiz('commit'));
});

test('quita palabras vacías en los dos idiomas', () => {
  assert.deepEqual(tokenizar('para el de la con the and for'), []);
});

test('las frases de exclusión no cuentan como vocabulario propio', () => {
  const d = 'Revisa un MR contra su spec. No la uses para la calidad del código. Tampoco para commits.';
  assert.equal(sinExclusiones(d), 'Revisa un MR contra su spec.');
  assert.equal(sinExclusiones('Does X. Do not use for Y.'), 'Does X.');
});

const SKILLS = [
  { name: 'escribir-commit', description: 'Redacta el mensaje de commit con Conventional Commits. No la uses para revisar código.' },
  { name: 'revisar-codigo', description: 'Revisión de la calidad del código antes del merge. No la uses para mensajes de commit.' },
  { name: 'documentar-decisiones', description: 'Registra decisiones de arquitectura como ADR.' },
];

test('ordenar pone primero la skill cuyo vocabulario coincide', () => {
  const corpus = construirCorpus(SKILLS);
  assert.equal(ordenar('redacta el commit de este cambio', corpus)[0].name, 'escribir-commit');
  assert.equal(ordenar('revisa la calidad de este código', corpus)[0].name, 'revisar-codigo');
  assert.equal(ordenar('registra esta decisión', corpus)[0].name, 'documentar-decisiones');
});

test('la exclusión no hace que una skill gane lo que dice que no le toca', () => {
  const corpus = construirCorpus(SKILLS);
  const ranking = ordenar('mensaje de commit', corpus);
  const commit = ranking.findIndex((r) => r.name === 'escribir-commit');
  const revisar = ranking.findIndex((r) => r.name === 'revisar-codigo');
  assert.ok(commit < revisar);
  assert.equal(ranking[revisar].puntos, 0);
});

test('un prompt sin vocabulario común puntúa 0 en todas', () => {
  const corpus = construirCorpus(SKILLS);
  assert.ok(ordenar('zzz qqq', corpus).every((r) => r.puntos === 0));
});

test('colisiones detecta dos descriptions casi iguales', () => {
  const corpus = construirCorpus([
    ...SKILLS,
    { name: 'otra-commit', description: 'Redacta el mensaje de commit con Conventional Commits.' },
  ]);
  const pares = colisiones(corpus, 0.5);
  assert.ok(pares.some((p) => [p.a, p.b].sort().join() === 'escribir-commit,otra-commit'));
  assert.ok(!pares.some((p) => p.a === 'documentar-decisiones' || p.b === 'documentar-decisiones'));
});
