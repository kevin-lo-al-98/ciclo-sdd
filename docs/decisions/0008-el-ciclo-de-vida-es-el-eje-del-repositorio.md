---
status: accepted
date: 2026-10-16
decision-makers: Kevin Lopez Alvarez
---

# El ciclo de vida del requerimiento al producto es el eje del repositorio; las skills técnicas son complemento

## Context and Problem Statement

El `README.md` y el `CLAUDE.md` presentaban el repositorio como un catálogo de skills por
especialidad, con el ciclo de vida SDD (`commands/sdd-*`) como un añadido ("Además de las
skills..."). El repositorio de origen de la metodología lo presentaba al revés: la cadena
**requerimiento → PRD → spec → código** como frase cabecera, y las skills como
procedimientos de apoyo por área.

En este repositorio la cadena ya existía, repartida en dos piezas que no se presentaban
juntas: `flujo-de-requerimientos` (qué construir) y los comandos `sdd-*` (cómo
implementarlo). ¿Qué debe leerse primero como propósito del repositorio?

## Decision Drivers

* Pedido explícito del dueño del repositorio: el ciclo de vida es el stack principal y las
  skills, un complemento
* Coherencia con el enfoque del repositorio de origen, del que este extrae la metodología
* Las skills técnicas (frontend, backend, base de datos, git) se usan dentro de la etapa de
  construcción; presentarlas como el centro oculta la cadena que les da sentido

## Considered Options

* Presentar el ciclo de vida como eje y las skills técnicas como complemento
* Mantener la presentación "skills primero"
* Copiar también la estructura de carpetas del origen (`requerimientos/`, `prd/`, `tareas/`)

## Decision Outcome

Chosen option: "presentar el ciclo de vida como eje", porque refleja para qué existe el
repositorio y coincide con el enfoque del origen.

Lo que fija:

* El `README.md` abre con la cadena de trabajo y agrupa las piezas en "qué construir",
  "cómo implementarlo" y "gobierno del ciclo"; el resto va en "Skills complementarias".
* La organización en archivos no cambia: `skills/` y `commands/` siguen igual
  ([ADR 0007](0007-agregar-commands-como-tipo-de-contenido-nuevo.md)). Solo cambia la
  narrativa.
* Toda skill nueva declara en qué grupo del `README.md` entra.

### Consequences

* Good, because quien llega al repositorio entiende primero la cadena y después las
  herramientas que la sirven
* Good, because `flujo-de-requerimientos` y los `sdd-*` se leen como una sola cadena, no
  como dos cosas sueltas
* Bad, because la frontera entre "gobierno del ciclo" y "complemento" es de criterio, y una
  skill nueva puede caer en el grupo equivocado

## Pros and Cons of the Options

### Copiar la estructura de carpetas del origen

* Good, because el parecido con el origen sería total
* Bad, because esas carpetas guardan los artefactos de un producto concreto, y este
  repositorio no tiene producto propio: distribuye el ciclo para que otros lo adopten. Las
  carpetas quedarían vacías

### Mantener "skills primero"

* Good, because no hay que tocar nada
* Bad, because contradice el propósito declarado y esconde la cadena detrás del catálogo
