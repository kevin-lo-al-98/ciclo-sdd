---
name: revisar-mr
description: Revisa un merge/pull request contra su spec y su PRD, no solo contra el estilo del código. Úsala cuando te toque revisar un MR/PR de un cambio SDD, cuando quieras comprobar que lo implementado cubre lo especificado, o antes de aprobar algo que toca una decisión ya documentada en docs/decisions/. Para la calidad del código en sí (legibilidad, arquitectura, seguridad, rendimiento) usa `code-review-and-quality`; las dos se complementan.
---

# Revisar un MR/PR contra lo que debía hacer

Revisar estilo es barato y lo hace el linter. Lo que no hace nadie salvo quien revisa es
comprobar que **el MR/PR entrega lo que la spec prometió y no contradice lo decidido**.

## Orden de revisión

### 1. ¿Qué debía hacer?

- Leé la `spec.md` del cambio SDD que el MR dice implementar (`openspec/changes/<nombre>/`
  o, si ya se archivó, `openspec/specs/<capability>/`). Si el MR no cita ninguna spec,
  **esa es la primera observación**: sin excepción explícita del proyecto (typos,
  comentarios, bumps sin cambio de comportamiento), no debería entrar código sin spec.
- Si el proyecto usa `flujo-de-requerimientos`, revisá también el PRD que la spec destila y
  la tarea de origen con su nivel de evidencia: la cobertura tiene que poder rastrearse
  hasta la tarea y el PRD.

### 2. Cobertura

Por cada escenario `DADO/CUANDO/ENTONCES` de la spec: **¿hay un test que lo ejecuta y
pasó?** No vale «parece que funciona». Si falta un escenario, el MR está incompleto aunque
el código esté bien.

### 3. Decisiones

Contrastá lo que el MR introduce contra `docs/decisions/` (skill `documentar-decisiones`).
Prestá atención especial a lo que suele pasar inadvertido en la revisión de cualquier
proyecto, más allá del dominio:

- Secretos en el árbol versionado o en logs.
- `catch` genérico o vacío que se traga el error.
- Timeouts sin acotar en llamadas HTTP, a la base de datos o a colas.
- Inyección de dependencias por campo en vez de por constructor (si el proyecto sigue esa
  convención).

### 4. Vocabulario del proyecto

Si el proyecto tiene un glosario de dominio (`CONTEXT.md`, skill
`entrevistar-con-contexto`, o uno propio), revisá que los nombres de clase, campo, endpoint
y texto de UI lo respeten. Un término prohibido o ambiguo en una interfaz pública es más
caro de corregir después que durante la revisión.

### 5. Dueño y verificación

Si el `CLAUDE.md` del proyecto tiene la sección «Ciclo de vida: roles» en modo `pareja` o
`equipo`, comprobá dos cosas:

- `proposal.md` declara `dueño`.
- El `verificado-por` de `verify-report.md` no coincide con el dueño ni con quien
  implementó según `apply-progress.md`. Si coincide y el veredicto es PASS a secas, es un
  hallazgo: la regla del proyecto exige que verifique otra persona.

En modo `solo`, o sin esa sección, este punto no aplica.

Si el proyecto usa la copia por proyecto de docs-skills (`.claude/docs-skills.version`) y
el MR la toca, compará su `version` con la anterior: una copia que retrocede de versión
suele ser un merge que se quedó con el lado viejo.

### 6. El MR/PR hermano (si aplica)

Si el proyecto reparte código y documentación de spec en repos distintos, confirmá que
ambos MR/PR se enlazan entre sí. Si falta el enlace, falta medio cambio. Si el proyecto
mantiene todo en un solo repo, este punto no aplica.

## Qué devolver

Hallazgos ordenados por gravedad, cada uno con **archivo:línea** y qué incumple (spec, PRD
o decisión). Sin archivo:línea no es un hallazgo, es una impresión.
