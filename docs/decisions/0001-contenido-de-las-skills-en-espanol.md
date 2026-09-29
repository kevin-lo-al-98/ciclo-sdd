---
status: accepted
date: 2026-09-28
decision-makers: Kevin Lopez Alvarez
---

# Escribir todo el contenido de las skills en español

## Context and Problem Statement

Las skills de este repositorio son instrucciones que otras sesiones de Claude Code cargan
como contexto, y su `description` decide si se cargan o no. El repositorio lo mantiene
una persona de habla hispana, que pide las cosas en español. Hay que fijar el idioma del
contenido, incluidos los comentarios de los ejemplos de código.

Esta decisión se registró a posteriori: la regla ya estaba en `CLAUDE.md` desde el
inicio del repositorio.

## Decision Drivers

* El `description` funciona por coincidencia con lo que el usuario escribe, y el usuario
  escribe en español
* Quien mantiene el repositorio tiene que poder revisar cada skill sin traducir mentalmente
* Los identificadores, las APIs y los términos técnicos no se traducen bien y no deben
  cambiar

## Considered Options

* Todo en español, con los términos técnicos en su forma original
* Todo en inglés
* Una versión en cada idioma

## Decision Outcome

Chosen option: "todo en español, con los términos técnicos en su forma original",
because el disparador de cada skill se escribe con las palabras que el usuario usaría,
y esas son españolas; y porque una sola versión evita mantener dos que se desincronizan.

### Consequences

* Good, because los disparadores coinciden con el lenguaje real del usuario
* Good, because una sola versión que revisar
* Bad, because las skills de terceros vendorizadas quedan fuera de la regla
  ([ADR 0002](0002-skills-vendorizadas-en-su-idioma-original.md))
* Bad, because el contenido no es reutilizable tal cual fuera del ámbito hispanohablante

### Confirmation

Se comprueba en la revisión de cada skill nueva o modificada.

## Pros and Cons of the Options

### Todo en inglés

* Good, because es el idioma de la documentación oficial y de las skills de terceros
* Bad, because el disparador de cada skill dejaría de coincidir con lo que el usuario
  escribe en español

### Una versión en cada idioma

* Good, because cubre a los dos públicos
* Bad, because duplica el mantenimiento y las dos copias se contradicen en cuanto una
  cambia
