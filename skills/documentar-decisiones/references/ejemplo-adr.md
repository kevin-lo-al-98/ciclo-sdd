# Un ADR flojo y el mismo ADR bien escrito

La diferencia no está en la longitud sino en qué queda registrado. El flojo anuncia una
decisión; el bueno permite volver a evaluarla cuando cambie el contexto.

## Flojo

```markdown
---
status: accepted
date: 2026-03-02
---

# Base de datos

## Context and Problem Statement

Necesitamos una base de datos.

## Considered Options

* PostgreSQL
* MongoDB
* MySQL

## Decision Outcome

Chosen option: "PostgreSQL", because es la mejor.

### Consequences

* Good, because es rápida
* Good, because es estable
* Good, because tiene buena comunidad
```

Qué falla:

- **El título es un tema**, no una decisión: hay que abrir el archivo para saber qué se
  eligió.
- **El contexto no dice nada** sobre qué datos, qué carga ni qué restricción existía.
  Sin eso no se puede saber cuándo la decisión deja de valer.
- **Las opciones parecen de relleno.** No hay un solo argumento en contra de ninguna, así
  que nadie sabe si se evaluaron o se listaron por completar.
- **"Es la mejor" no es una justificación.** No enlaza el resultado con ningún factor.
- **Solo hay consecuencias positivas.** Una decisión sin coste no existe.
- **Sin `Confirmation`, y con `accepted` desde el primer día:** nadie la confirmó.

## Bien escrito

```markdown
---
status: accepted
date: 2026-03-02
decision-makers: equipo de catálogo
---

# Usar PostgreSQL para el catálogo de productos

## Context and Problem Statement

El catálogo tiene relaciones fuertes (producto → variantes → precios por región) y las
consultas del panel de administración cruzan tres de ellas. Hay que elegir el motor
antes de escribir el modelo, porque cambiarlo después implica reescribir las consultas.

## Decision Drivers

* Las consultas cruzan varias entidades relacionadas
* El equipo ya opera PostgreSQL en otro servicio
* El volumen previsto (unos 200 000 productos) no exige escalado horizontal

## Considered Options

* PostgreSQL
* MongoDB
* MySQL

## Decision Outcome

Chosen option: "PostgreSQL", because resuelve las consultas relacionales con `JOIN`
sin duplicar datos y el equipo ya sabe operarlo.

### Consequences

* Good, because una sola base sirve el catálogo y los informes del panel
* Bad, because el esquema exige migraciones para cada cambio de estructura
* Bad, because si el volumen crece mucho más de lo previsto habrá que replantear el
  escalado, que aquí no se ha resuelto

### Confirmation

Se revisa en cada PR que toque el modelo: las migraciones van en `db/migrations/` y
ninguna consulta del panel se resuelve fuera de la base.

## Pros and Cons of the Options

### MongoDB

* Good, because el esquema es flexible para atributos de producto variables
* Bad, because las consultas del panel exigen cruzar colecciones a mano
* Bad, because nadie del equipo lo opera hoy

### MySQL

* Good, because el equipo lo conoce
* Neutral, because cubre el caso, pero sin las ventajas de tipos ricos que se
  aprovecharían en los atributos de producto

## More Information

Revisar si el catálogo supera el millón de productos.
```

Qué cambia:

- El **título** resume problema y solución.
- El **contexto** da las restricciones, así que se ve cuándo revisarla (el último
  párrafo lo dice).
- Las **opciones** tienen argumentos a favor y en contra, y por eso la elección se puede
  discutir.
- Las **consecuencias negativas** son honestas, incluido lo que no se ha resuelto.
- La **confirmación** es comprobable en un PR, no una declaración de intenciones.
