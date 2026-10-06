---
status: accepted
date: 2026-10-06
decision-makers: Kevin Lopez Alvarez
---

# Registrar cuándo traer cada decisión en el frontmatter de su ADR

## Context and Problem Statement

MADR dice qué se decidió y por qué, pero no dice **cuándo consultar** cada decisión. Un
agente que va a tocar el esquema de la base de datos no tiene forma de saber, sin abrirlos
todos, cuál de los 30 ADRs aplica. La [ADR 0000](0000-usar-madr-para-registrar-decisiones.md)
dejó anotado este hueco y dijo que cubrirlo sería una decisión nueva.

Un proyecto de referencia lo resuelve con un registro aparte donde cada entrada lleva `Trigger` (cuándo
traerla) y `Scope` (a qué archivos aplica), más un segundo nivel de archivos con el
`Decision` copiado verbatim. La copia ahorra bytes por consulta, pero exige un validador
que compruebe que no diverge de su fuente.

## Decision Drivers

* El agente debe poder decidir qué ADR abrir sin abrirlos todos
* Un ADR no debe describirse en dos sitios que puedan contradecirse
* La fase 1 de la librería no lleva código, así que nada puede depender de un validador
* La plantilla debe seguir siendo MADR válido, utilizable con herramientas que lo lean

## Considered Options

* Claves opcionales `trigger` y `scope` en el frontmatter de cada ADR, y un índice
  `docs/decisions/README.md` que las proyecta
* Un índice `docs/decisions/README.md` con una columna «Traer cuando», sin tocar el ADR
* El registro de dos niveles de ADR Zoom, con copia verbatim del `Decision`
* No registrar nada: el agente busca con grep

## Decision Outcome

Chosen option: "claves opcionales `trigger` y `scope` en el frontmatter, con un índice que
las proyecta", because la fuente de verdad queda dentro del ADR, que es lo que se edita al
cambiar la decisión, y el índice es solo una vista. MADR admite claves adicionales en su
frontmatter sin dejar de ser MADR.

* `trigger`: una frase con las situaciones en que hay que traer la decisión.
* `scope`: lista opcional de rutas o patrones a los que aplica.
* El índice tiene una fila por ADR: número, título, estado y `trigger`.

### Consequences

* Good, because el agente lee un índice corto y abre solo el ADR que dispara
* Good, because no hay segunda copia del `Decision` que pueda divergir
* Good, because cuando haya un validador (fase 3) tendrá una fuente única que leer
* Bad, because sin validador el índice se mantiene a mano y deriva de los frontmatter
* Bad, because dos claves más en cada ADR, y un `trigger` mal escrito hace que la decisión
  no se consulte nunca
* Bad, because se pierde el ahorro de leer solo el `Decision` en lugar del ADR entero

### Confirmation

Se comprueba en la revisión que todo ADR nuevo con `status: accepted` tenga `trigger` y
una fila en el índice. Un validador podrá automatizarlo si se acepta el código de la fase 3.

## Pros and Cons of the Options

### Un índice con «Traer cuando», sin tocar el ADR

* Good, because no cambia el formato del ADR
* Bad, because el `trigger` vive lejos de la decisión: al editar el ADR nadie lo revisa

### Registro de dos niveles de ADR Zoom

* Good, because ahorra ~65 % de bytes por consulta según la medición de ese proyecto
* Bad, because necesita un validador para sostener la copia verbatim, y la fase 1 no lo tiene
* Bad, because ya se descartó en la ADR 0000 por pensarse para un catálogo compartido

### No registrar nada

* Good, because no hay nada que mantener
* Bad, because con un catálogo grande el agente o abre todo o se pierde decisiones

## More Information

Se aplica en la fase 2 de [`docs/specs/adopcion-de-arquitectura-documental.md`](../specs/adopcion-de-arquitectura-documental.md),
ampliando `documentar-decisiones`. Revisar cuando el catálogo pase de unas 30 decisiones: a
partir de ahí puede compensar la copia por niveles.
