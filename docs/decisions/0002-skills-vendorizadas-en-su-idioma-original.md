---
status: accepted
date: 2026-09-28
decision-makers: Kevin Lopez Alvarez
---

# Mantener las skills vendorizadas en su idioma original y sin reescribir

## Context and Problem Statement

`skills/skill-security-scan/` es material de terceros: una taxonomía derivada de NVIDIA
SkillSpector bajo licencia Apache-2.0. Está en inglés, lo que contradice la regla de
que todo el contenido va en español ([ADR 0001](0001-contenido-de-las-skills-en-espanol.md)).
Hay que decidir si se traduce, y cómo tratar en general el material vendorizado.

Esta decisión se registró a posteriori: la regla ya estaba en `CLAUDE.md` desde que se
vendorizó la skill.

## Decision Drivers

* La taxonomía se actualiza aguas arriba y una traducción se quedaría atrás sin que nadie
  lo note
* La licencia Apache-2.0 exige conservar `LICENSE` y `NOTICE` y documentar los cambios
* Quien lea el archivo no debe creer que es material original de este repositorio

## Considered Options

* Mantenerla en inglés y sin reescribir, documentando los cambios en `NOTICE`
* Traducirla al español
* No vendorizarla: consumirla desde su origen

## Decision Outcome

Chosen option: "mantenerla en inglés y sin reescribir", because traducirla equivale a
mantener un fork de una taxonomía ajena que cambia aguas arriba, y ese fork se
desactualizaría en silencio.

Reglas para este tipo de carpetas:

* No se reescribe su contenido. Si algo debe cambiar, se documenta en `NOTICE` con fecha
  y alcance del cambio.
* `LICENSE` y `NOTICE` se conservan: no se mueven ni se resumen.
* Para actualizar, se trae la versión nueva de aguas arriba y se vuelve a aplicar la
  modificación local, no al revés.

### Consequences

* Good, because la actualización desde el origen es directa
* Good, because queda claro qué es de terceros
* Bad, because una carpeta del repositorio incumple la regla del español y hay que
  recordar la excepción
* Bad, because su `description` mezcla disparadores en inglés y en español, y eso
  depende de que alguien lo mantenga a mano

### Confirmation

Al tocar `skills/skill-security-scan/`, se comprueba que `NOTICE` recoja el cambio.

## Pros and Cons of the Options

### Traducirla al español

* Good, because el repositorio sería uniforme
* Bad, because la traducción se queda atrás de cada actualización aguas arriba

### No vendorizarla

* Good, because no habría material ajeno que conservar
* Bad, because la skill dejaría de estar disponible sin conexión y dependería de que el
  origen se mantenga
