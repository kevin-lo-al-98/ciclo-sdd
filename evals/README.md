# Verificación de skills

Una `description` mal escrita no rompe nada visible: la skill simplemente no se carga, o
se carga en lugar de otra. Por eso este repositorio la comprueba en tres niveles, de lo
más barato a lo más fiel. La decisión de tener código para esto está en el
[ADR 0012](../docs/decisions/0012-scripts-de-verificacion-sin-dependencias.md). El enfoque
es una adaptación del de
[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills); qué se cambió, y
por qué, está en [`scripts/NOTICE-agent-skills`](../scripts/NOTICE-agent-skills).

| Nivel | Qué detecta | Comando | Coste |
|---|---|---|---|
| 1. Estructura | frontmatter que Claude Code o el servidor MCP leen vacío, `name` distinto de la carpeta, enlaces rotos, comandos sin `argument-hint`, versión sin CHANGELOG | `node scripts/validar.mjs` | Gratis, en CI |
| 2. Disparadores | una `description` sin las palabras que usa la gente, o tan amplia que le gana a la skill correcta | `node scripts/evaluar-disparadores.mjs` | Gratis, en CI |
| 3. Comportamiento | si Claude Code dispara de verdad la skill y si cambia la respuesta | `claude plugin eval .` | Tokens, bajo demanda |

Los tests de los propios validadores: `node --test "scripts/lib/*.test.mjs"`.

## Nivel 1: estructura

`scripts/validar.mjs` aplica las reglas de `scripts/lib/lint.mjs`. Lee el frontmatter
con el mismo código que el servidor MCP (`mcp/src/skills.js`), así que no puede dar por
buena una skill que por MCP llega vacía.

Los **errores** bloquean el CI. Los más valiosos son los que Claude Code no avisa:

- un valor sin comillas que contiene `: ` o ` #`, que Claude Code descarta en silencio;
- un `description: >` multilínea, que el servidor MCP recibe vacío.

Los **avisos** no bloquean. Señalan, entre otras cosas, una `description` sin «Úsala
cuando…» o sin «No la uses…», un archivo enlazado fuera de `references/` (que el MCP no
sirve) o un `SKILL.md` de más de 500 líneas.

## Nivel 2: disparadores y ruteo

`scripts/evaluar-disparadores.mjs` compara cada prompt de `evals/cases/<skill>.json` con
las descriptions de todas las skills (TF-IDF y coseno, con las tildes normalizadas y
sufijos en español e inglés) y comprueba que:

- cada prompt **positivo** deja a su skill entre las 3 primeras (`top_k` lo cambia);
- cada prompt **negativo** lo gana su `owner`, otra skill, por delante de esta;
- ningún par de descriptions se parece más de 0,75 (aviso desde 0,5);
- el porcentaje de positivos que quedan en primer lugar (rank-1) no baja del piso que
  fija el CI con `--min-rank1`.

Las frases de exclusión de una description («No la uses para…», «Tampoco…») no cuentan
como vocabulario propio: nombran el terreno de otra skill.

Para ver cómo rutea un prompt concreto:

```bash
node scripts/evaluar-disparadores.mjs --prompt "listo, haz el commit"
```

Es una aproximación léxica: no entiende la semántica, y una skill que puntúa bien aquí
puede no dispararse en una sesión real. Detecta los dos fallos más frecuentes (falta de
vocabulario y solapes) a coste cero. **Si falla, arregla la description, no el prompt.**

### Formato de un caso

```json
{
  "skill_name": "escribir-mensaje-de-commit",
  "trigger": {
    "positive": [
      { "prompt": "listo, haz el commit" },
      { "prompt": "cómo redacto el mensaje de este commit", "top_k": 1 }
    ],
    "negative": [
      { "prompt": "revisa este diff antes de subirlo", "owner": "code-review-and-quality" }
    ]
  }
}
```

Reglas:

- Al menos 3 positivos y 2 negativos. El `owner` es obligatorio, porque sin él un
  negativo pasaría con solo no parecerse a nada.
- Los prompts parafrasean cómo pide las cosas una persona; no se copian frases de la
  description. Eso inflaría el resultado sin probar nada.
- Los negativos apuntan a los solapes reales, como `revisar-mr` ↔
  `code-review-and-quality` o `git-worktree` ↔ `resolver-merge`.

## Nivel 3: `claude plugin eval`

`claude plugin eval` (Claude Code 2.1.269 o posterior) carga el plugin entero, ejecuta los
casos de `evals/plugin/` y, por defecto, repite cada caso sin el plugin para medir lo que
aporta (la columna Δ). La carpeta se declara en `.claude-plugin/plugin.json`
(`experimental.evals`), de modo que `evals/cases/` nunca se lee como caso.

```bash
# Una iteración barata: un caso, una pasada, sin brazo base
claude plugin eval . --no-publish --case revisar-mr-se-activa --runs 1 --ablation none --model claude-opus-5-5

# La medición completa: los dos brazos, 3 pasadas por caso
claude plugin eval . --no-publish --model claude-opus-5-5
```

Cada caso es una carpeta con `prompt.md` (frontmatter con límites de turnos y
herramientas; el cuerpo se envía tal cual) y un grader por archivo en `graders/`. Hay un
par por skill crítica: uno «se activa» y otro «no se activa», donde la debe ganar otra
skill.

- Un grader `tool_used: Skill` solo dice si la skill se disparó, y en una pasada con dos
  brazos no puntúa. Cada caso «se activa» lleva además un grader `regex` o `llm` sobre la
  respuesta.
- Los casos «no se activa» llevan `min: 0, max: 0` para la skill bajo prueba, más un
  indicador `arm: with-only` de la skill que debería ganar. Con `--ablation none` ese
  indicador cuenta en la nota. Por eso una nota de 0,50 ahí puede significar solo que
  ninguna skill se disparó.
- El agente no puede escribir archivos (`allowed_tools: [Read, Glob, Grep, Skill]`): un
  grader `llm` debe aceptar un borrador presentado en la respuesta.

`--no-publish` mantiene el informe en local; sin esa opción se publica en claude.ai. Los
informes quedan en `evals/plugin/results/`, que está en `.gitignore`. Cada pasada es una
llamada real al modelo con tu cuenta: nunca corre en CI.

### Lo que hay que saber antes de leer los números

Estas lecciones vienen de agent-skills y se confirmaron aquí:

- **La activación es estocástica.** Una sola pasada no demuestra nada: lee el informe y
  el Δ con `--runs 3` o más, no el código de salida.
- **Fija `--model` y apunta la versión de Claude Code** al reportar números. La CLI se
  actualiza sola y el modelo por defecto cambia.
- **La palanca es la description.** En agent-skills, añadir que la skill «aplica incluso
  cuando el diff viene pegado» llevó la de review de 7/27 a 21/27 disparos sin falsos
  positivos.
- **Revisa el grader antes de culpar a la skill.** En la primera pasada de aquí, el juez
  falló el ADR de `documentar-decisiones-se-activa` porque lo leía como «no registrado».
  En realidad era un borrador correcto, en un caso sin herramientas de escritura.

### Primera medición (2026-10-17, Claude Code 2.1.302, claude-opus-5-5, 1 pasada, sin brazo base)

| Caso | Nota | Observación |
|---|---|---|
| `documentar-decisiones-se-activa` | 1,00 | 0,67 en la primera pasada por el grader ambiguo; 1,00 tras aclararlo |
| `documentar-decisiones-no-se-activa-en-commit` | 1,00 | |
| `flujo-de-requerimientos-se-activa` | 1,00 | |
| `flujo-de-requerimientos-no-se-activa-en-adr` | 1,00 | |
| `revisar-mr-se-activa` | 1,00 | detectó el criterio de 10 000 filas sin implementar |
| `revisar-mr-no-se-activa-sin-spec` | 1,00 | |
| `escribir-mensaje-de-commit-se-activa` | 1,00 | |
| `escribir-mensaje-de-commit-no-se-activa-en-revision` | 0,50 | la skill de commit no se disparó (correcto); `code-review-and-quality` tampoco |

Coste total: unos 1,9 USD. Con una pasada no se puede hablar de tasas; es la línea de
partida para medir con `--runs 3` y con brazo base.

## Al añadir o cambiar una skill

1. Añade `evals/cases/<skill>.json`: sin él, el nivel 2 falla en CI.
2. Corre `node scripts/validar.mjs` y `node scripts/evaluar-disparadores.mjs`.
3. Si la skill es crítica o compite con otra, añade su par en `evals/plugin/` y mídelo.
