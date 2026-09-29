# Plantilla MADR 4.0

Basada en la plantilla oficial de [MADR 4.0.0](https://adr.github.io/madr/): mismas
claves de frontmatter, mismas secciones, mismo orden. Solo se traducen los comentarios
guía. Los encabezados quedan en inglés a propósito (ver el `SKILL.md`).

Ubicación: `docs/decisions/NNNN-titulo-con-guiones.md`.

Todo lo marcado como opcional se **borra** si no aporta. El frontmatter completo es
opcional: en un proyecto de una persona, `decision-makers`, `consulted` e `informed`
suelen sobrar.

## Plantilla completa

```markdown
---
status: "{proposed | rejected | accepted | deprecated | superseded by ADR-NNNN}"
date: {AAAA-MM-DD de la última actualización de la decisión}
decision-makers: {quién decidió}
consulted: {a quién se pidió opinión; comunicación en dos sentidos}
informed: {a quién se mantiene al tanto; comunicación en un sentido}
---

# {título corto: el problema resuelto y la solución hallada}

## Context and Problem Statement

{El contexto y el problema, en dos o tres frases o como pregunta. Deja explícito el
alcance: qué componentes toca. Enlaza al issue o a la spec si existe.}

## Decision Drivers

* {factor 1: una cualidad buscada, una restricción, una fuerza}
* {factor 2}

## Considered Options

* {opción 1}
* {opción 2}
* {opción 3}

## Decision Outcome

Chosen option: "{opción 1}", because {justificación: cumple el criterio eliminatorio,
resuelve la fuerza X, sale mejor en la comparación de abajo…}.

### Consequences

* Good, because {consecuencia positiva}
* Bad, because {consecuencia negativa: qué cualidad se sacrifica}

### Confirmation

{Cómo se comprobará que la implementación cumple el ADR: una regla de lint, un test,
una revisión concreta. Si es manual, dilo. Opcional.}

## Pros and Cons of the Options

### {opción 1}

* Good, because {argumento}
* Neutral, because {argumento que no pesa ni a favor ni en contra}
* Bad, because {argumento}

### {opción 2}

* Good, because {argumento}
* Bad, because {argumento}

## More Information

{Evidencia adicional, cuándo revisar la decisión, enlaces a otros ADRs y a recursos.}
```

## Variante mínima

Para decisiones pequeñas. Es la misma plantilla sin lo opcional, con `Consequences`
obligatoria:

```markdown
# {título corto: el problema resuelto y la solución hallada}

## Context and Problem Statement

{Contexto y problema en dos o tres frases.}

## Considered Options

* {opción 1}
* {opción 2}

## Decision Outcome

Chosen option: "{opción 1}", because {justificación}.

### Consequences

* Good, because {consecuencia positiva}
* Bad, because {consecuencia negativa}
```

## Estados

| `status` | Cuándo |
|---|---|
| `proposed` | Redactado, sin confirmar por quien decide |
| `accepted` | Confirmado y vigente |
| `rejected` | Se evaluó y se descartó; se conserva |
| `deprecated` | Ya no aplica, sin sustituto |
| `superseded by ADR-NNNN` | Lo reemplaza otro; se enlaza al sucesor |
