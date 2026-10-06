---
status: accepted
date: 2026-10-06
decision-makers: Kevin Lopez Alvarez
---

# Generar lo que producen las skills en el idioma del proyecto adoptante

## Context and Problem Statement

Al convertir estas skills en una librería abierta, aparece una tensión con la
[ADR 0001](0001-contenido-de-las-skills-en-espanol.md): las skills están escritas en
español, pero un proyecto que las adopte puede trabajar en otro idioma. Hay que distinguir
dos contenidos que la ADR 0001 no separaba: el **de las skills** (instrucciones para
Claude) y el **que las skills generan** en el proyecto adoptante (ADRs, specs, requerimientos).

## Decision Drivers

* Las skills se disparan por lo que el usuario escribe, y hoy eso es español
* Mantener dos versiones de cada skill se desincroniza (razón por la que la ADR 0001 lo rechazó)
* Un proyecto no debe recibir ADRs en un idioma distinto del que usa su equipo
* La plantilla MADR conserva sus encabezados en inglés por compatibilidad

## Considered Options

* Skills en español; lo que generan, en el idioma del proyecto adoptante
* Skills y salidas siempre en español
* Skills y salidas siempre en inglés

## Decision Outcome

Chosen option: "skills en español; lo generado, en el idioma del proyecto", because separa
lo que se mantiene aquí (una sola versión) de lo que vive en el proyecto ajeno, y no impone
el español a quien adopte la librería.

Las skills nuevas y las ampliadas incluyen la instrucción de detectar el idioma del
proyecto —por su `CLAUDE.md` y por sus documentos existentes— y de preguntarlo si no está
claro. Los encabezados MADR y las claves de frontmatter se mantienen en inglés, como hasta ahora.

### Consequences

* Good, because la ADR 0001 sigue vigente sin enmienda
* Good, because un proyecto en inglés recibe documentos en inglés
* Bad, because la librería solo se **descubre** y se **dispara** en español: quien escriba
  en otro idioma puede no activar las skills
* Bad, because depende de que el modelo siga la instrucción de idioma, y nada lo verifica
  salvo la revisión
* Bad, because las plantillas llevan comentarios guía en español que el modelo debe
  traducir al rellenarlas

### Confirmation

Se comprueba en la revisión de cada skill nueva o ampliada que lleve la instrucción de
idioma. Probar a adoptarla en un proyecto en inglés antes de publicar.

## Pros and Cons of the Options

### Skills y salidas siempre en español

* Good, because cero ambigüedad
* Bad, because impone el español a todo proyecto adoptante

### Skills y salidas siempre en inglés

* Good, because es el idioma habitual del software abierto
* Bad, because contradice la ADR 0001 y rompe los disparadores actuales, que son frases en español

## More Information

Traducir las propias skills sería una decisión nueva, con su ADR, que valoraría de nuevo
mantener dos versiones. Spec asociada:
[`docs/specs/adopcion-de-arquitectura-documental.md`](../specs/adopcion-de-arquitectura-documental.md).
