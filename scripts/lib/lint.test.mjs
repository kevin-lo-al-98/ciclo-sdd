// Tests de las reglas de lint. Correr con: node --test scripts/lib/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  enlacesRelativos,
  faltanEnReadme,
  lintAgente,
  lintComando,
  lintSkill,
  lintVersion,
  quitarBloquesDeCodigo,
  referenciasASkills,
  resolverRelativa,
  revisarEscalar,
} from './lint.mjs';

const DESC_OK = 'Hace algo concreto. Úsala cuando el usuario pida X. No la uses para Y.';

function skill(frontmatter, cuerpo = '\n# Título\n') {
  return `---\n${frontmatter}\n---\n${cuerpo}`;
}

const sinErrores = (r) => assert.deepEqual(r.errores, [], r.errores.join('\n'));
const conError = (r, fragmento) =>
  assert.ok(r.errores.some((e) => e.includes(fragmento)), `se esperaba un error con «${fragmento}»; hubo: ${r.errores.join(' | ')}`);
const conAviso = (r, fragmento) =>
  assert.ok(r.avisos.some((e) => e.includes(fragmento)), `se esperaba un aviso con «${fragmento}»; hubo: ${r.avisos.join(' | ')}`);

// ─── Frontmatter de skills ───────────────────────────────────────────────────

test('una skill correcta no da errores ni avisos', () => {
  const r = lintSkill('mi-skill', skill(`name: mi-skill\ndescription: ${DESC_OK}`));
  sinErrores(r);
  assert.deepEqual(r.avisos, []);
});

test('sin frontmatter', () => {
  conError(lintSkill('mi-skill', '# Solo cuerpo\n'), 'falta el frontmatter');
});

test('name y description obligatorios', () => {
  const r = lintSkill('mi-skill', skill('license: MIT'));
  conError(r, 'falta `name`');
  conError(r, 'falta `description`');
});

test('name distinto de la carpeta', () => {
  conError(lintSkill('mi-skill', skill(`name: otra\ndescription: ${DESC_OK}`)), 'no coincide con la carpeta');
});

test('carpeta fuera de kebab-case', () => {
  conError(lintSkill('Mi_Skill', skill(`name: Mi_Skill\ndescription: ${DESC_OK}`)), 'kebab-case');
});

test('name con «--» o de más de 64 caracteres', () => {
  conError(lintSkill('a--b', skill(`name: a--b\ndescription: ${DESC_OK}`)), '«--»');
  const largo = 'a'.repeat(65);
  conError(lintSkill(largo, skill(`name: ${largo}\ndescription: ${DESC_OK}`)), 'máximo 64');
});

test('description de más de 1024 caracteres', () => {
  const r = lintSkill('mi-skill', skill(`name: mi-skill\ndescription: ${DESC_OK} ${'x'.repeat(1024)}`));
  conError(r, 'máximo 1024');
});

test('clave de primer nivel desconocida', () => {
  conError(lintSkill('mi-skill', skill(`name: mi-skill\ndescription: ${DESC_OK}\nautor: yo`)), 'clave `autor` no admitida');
});

test('las extensiones de Claude Code se admiten', () => {
  sinErrores(lintSkill('mi-skill', skill(`name: mi-skill\ndescription: ${DESC_OK}\nargument-hint: tema\ndisable-model-invocation: true`)));
});

test('metadata anidada no cuenta como clave de primer nivel', () => {
  sinErrores(lintSkill('mi-skill', skill(`name: mi-skill\ndescription: ${DESC_OK}\nmetadata:\n  author: alguien\n  version: "1.0"`)));
});

test('description multilínea con > o |', () => {
  conError(lintSkill('mi-skill', skill('name: mi-skill\ndescription: >\n  Algo largo')), 'bloque multilínea');
  conError(lintSkill('mi-skill', skill('name: mi-skill\ndescription: |-\n  Algo largo')), 'bloque multilínea');
});

test('description partida en líneas sangradas', () => {
  conError(lintSkill('mi-skill', skill(`name: mi-skill\ndescription: ${DESC_OK}\n  y sigue aquí`)), 'varias líneas');
});

// ─── Escalares YAML ──────────────────────────────────────────────────────────

test('sin comillas y con «: » se descarta en silencio', () => {
  assert.match(revisarEscalar('description', 'Hace X. Úsala cuando: pase Y').join(), /«: »/);
});

test('sin comillas y con « #» se corta', () => {
  assert.match(revisarEscalar('description', 'Revisa el canal #general').join(), /« #»/);
});

test('sin comillas y con inicio reservado', () => {
  assert.match(revisarEscalar('description', '`git` para todo').join(), /reservado/);
  assert.match(revisarEscalar('description', '[beta] algo').join(), /reservado/);
});

test('comillas simples bien formadas, incluso con «: » y apóstrofo doble', () => {
  assert.deepEqual(revisarEscalar('description', "'Úsala cuando: pase algo, it''s fine'"), []);
});

test('comillas simples sin cerrar o con apóstrofo suelto', () => {
  assert.match(revisarEscalar('description', "'Úsala cuando pase").join(), /no la cierra/);
  assert.match(revisarEscalar('description', "'it's broken'").join(), /sin duplicar/);
});

test('comillas dobles bien formadas y con escape', () => {
  assert.deepEqual(revisarEscalar('description', '"Trigger: say \\"hi\\""'), []);
  assert.match(revisarEscalar('description', '"sin cerrar').join(), /no la cierra/);
  assert.match(revisarEscalar('description', '"a " b"').join(), /sin escapar/);
});

test('un valor sin comillas normal pasa', () => {
  assert.deepEqual(revisarEscalar('description', 'Estándares para Angular (signals, RxJS). Úsala cuando…'), []);
});

// ─── Disparadores en la description ──────────────────────────────────────────

test('avisa si la description no dice cuándo usarla', () => {
  conAviso(lintSkill('mi-skill', skill('name: mi-skill\ndescription: Hace cosas. No la uses para Y.')), 'cuándo usarla');
});

test('avisa si la description no dice cuándo no usarla', () => {
  conAviso(lintSkill('mi-skill', skill('name: mi-skill\ndescription: Hace cosas. Úsala cuando pase X.')), 'cuándo NO usarla');
});

test('acepta disparadores en inglés', () => {
  const r = lintSkill('mi-skill', skill('name: mi-skill\ndescription: Does things. Use when X happens. Do not use for Y.'));
  assert.deepEqual(r.avisos, []);
});

// ─── Tamaño, enlaces y referencias ───────────────────────────────────────────

test('avisa por encima de 500 líneas', () => {
  const r = lintSkill('mi-skill', skill(`name: mi-skill\ndescription: ${DESC_OK}`, '\n'.repeat(510)));
  conAviso(r, '500');
});

test('enlace roto es error; enlace a references/ que existe pasa', () => {
  const existe = (rel) => rel === 'references/a.md';
  const cuerpo = '\nVer [a](references/a.md) y [b](./references/b.md).\n';
  const r = lintSkill('mi-skill', skill(`name: mi-skill\ndescription: ${DESC_OK}`, cuerpo), { existe });
  conError(r, 'references/b.md');
  assert.equal(r.errores.length, 1);
});

test('enlace fuera de references/ o fuera de la skill es aviso', () => {
  const cuerpo = '\n[x](assets/x.md) [y](../otra/SKILL.md) [n](NOTICE)\n';
  const r = lintSkill('mi-skill', skill(`name: mi-skill\ndescription: ${DESC_OK}`, cuerpo));
  conAviso(r, 'fuera de references/');
  conAviso(r, 'sale de la carpeta');
  assert.equal(r.avisos.length, 2);
});

test('enlaces en código, URLs y anclas no cuentan', () => {
  const cuerpo = '[web](https://x.com) [ancla](#seccion)\n`[plantilla](ruta.md)`\n```\n[ejemplo](falta.md)\n```\n';
  assert.deepEqual(enlacesRelativos(cuerpo), []);
});

test('el ancla de un enlace relativo se descarta', () => {
  assert.deepEqual(enlacesRelativos('[a](references/a.md#parte)'), ['references/a.md']);
});

test('resolverRelativa normaliza y detecta la salida de la base', () => {
  assert.equal(resolverRelativa('./references/../references/a.md'), 'references/a.md');
  assert.equal(resolverRelativa('../x.md'), null);
});

test('referencias a skills inexistentes son aviso; externas y propias no', () => {
  const cuerpo = '\nPara eso usa `otra-skill`. Consulta la skill `claude-api`. Ver skill `no-existe`.\n';
  const r = lintSkill('mi-skill', skill(`name: mi-skill\ndescription: ${DESC_OK}`, cuerpo), {
    skillsConocidas: new Set(['mi-skill', 'otra-skill']),
  });
  conAviso(r, '`no-existe`');
  assert.equal(r.avisos.length, 1);
});

test('referencias dentro de bloques de código no cuentan', () => {
  assert.deepEqual([...referenciasASkills('```\nusa `fantasma-x`\n```\n')], []);
});

test('quitarBloquesDeCodigo respeta ~~~, sangría y cierres más largos', () => {
  const texto = 'a\n  ~~~\nb\n~~~~\nc\n```\nd\n``\ne\n```\nf';
  assert.equal(quitarBloquesDeCodigo(texto), 'a\n\n\n\nc\n\n\n\n\n\nf');
});

// ─── Comandos y agentes ──────────────────────────────────────────────────────

test('comando correcto', () => {
  sinErrores(lintComando('sdd-new.md', '---\ndescription: Arranca algo.\nargument-hint: nombre\n---\n\nHaz $ARGUMENTS.\n'));
});

test('comando con name, sin description o con $ARGUMENTS sin hint', () => {
  const r = lintComando('x.md', '---\nname: x\n---\n\nHaz $ARGUMENTS.\n');
  conError(r, 'no lleva `name`');
  conError(r, 'falta `description`');
  conError(r, 'falta `argument-hint`');
});

test('comando con hint pero sin argumentos es aviso', () => {
  conAviso(lintComando('x.md', '---\ndescription: Algo.\nargument-hint: tema\n---\n\nSin argumentos.\n'), 'no usa $ARGUMENTS');
});

test('agente con name distinto del archivo', () => {
  conError(lintAgente('revisor.md', '---\nname: otro\ndescription: Revisa.\n---\n'), 'no coincide con el archivo');
  sinErrores(lintAgente('revisor.md', '---\nname: revisor\ndescription: Revisa.\n---\n'));
});

// ─── Repositorio ─────────────────────────────────────────────────────────────

test('versión sin entrada en el CHANGELOG', () => {
  const plugin = JSON.stringify({ name: 'p', version: '0.2.0' });
  const mercado = JSON.stringify({ plugins: [{ name: 'p' }] });
  assert.deepEqual(lintVersion(plugin, mercado, '## 0.2.0 — hoy\n'), []);
  assert.match(lintVersion(plugin, mercado, '## 0.1.0 — ayer\n').join(), /no tiene la entrada/);
  assert.match(lintVersion(plugin, JSON.stringify({ plugins: [] }), '## 0.2.0\n').join(), /no lista el plugin/);
  assert.match(lintVersion('{', null, '').join(), /no es JSON/);
});

test('README sin una skill o un comando', () => {
  const readme = '| [`a`](skills/a/) |\n| [`/c`](commands/c.md) |';
  assert.deepEqual(faltanEnReadme(readme, ['a', 'b'], ['c', 'd']), ['skill `b`', 'comando `/d`']);
});
