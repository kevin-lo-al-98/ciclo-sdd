---
name: entrevistar-con-contexto
description: Sesión de interrogatorio que pone a prueba tu plan contra el modelo de dominio existente, afila la terminología, y actualiza la documentación (CONTEXT.md, ADRs) en línea a medida que las decisiones se cristalizan. Úsala cuando el usuario quiera poner a prueba un plan contra el lenguaje y las decisiones ya documentadas de su proyecto.
---

<que-hacer>

Entrevistame sin piedad sobre cada aspecto de este plan hasta llegar a un entendimiento
compartido. Recorré cada rama del árbol de diseño, resolviendo las dependencias entre
decisiones una por una. Para cada pregunta, proponé tu respuesta recomendada.

Hacé las preguntas de una en una, esperando la respuesta a cada una antes de seguir con la
siguiente.

Si una pregunta se puede responder explorando el código, explorá el código en vez de
preguntar.

</que-hacer>

<informacion-de-apoyo>

## Conciencia del dominio

Durante la exploración del código, buscá también documentación existente:

### Estructura de archivos

La mayoría de los repos tienen un solo contexto:

```
/
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

Si existe un `CONTEXT-MAP.md` en la raíz, el repo tiene múltiples contextos. El mapa indica
dónde vive cada uno y cómo se relacionan:

```
/
├── CONTEXT-MAP.md
├── docs/
│   └── adr/                          ← decisiones de todo el sistema
├── src/
│   ├── ordering/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                 ← decisiones propias de ese contexto
│   └── billing/
│       ├── CONTEXT.md
│       └── docs/adr/
```

Creá los archivos de forma perezosa — solo cuando tengas algo para escribir. Si no existe
`CONTEXT.md`, creá uno cuando se resuelva el primer término. Si no existe `docs/adr/`,
creala cuando haga falta el primer ADR.

## Durante la sesión

### Contrastá contra el glosario

Cuando el usuario use un término que entra en conflicto con el lenguaje ya existente en
`CONTEXT.md`, marcalo de inmediato. "Tu glosario define 'cancelación' como X, pero parece
que te referís a Y — ¿cuál de las dos es?"

### Afilá el lenguaje ambiguo

Cuando el usuario use términos vagos o sobrecargados, proponé un término canónico preciso.
"Decís 'cuenta' — ¿te referís al Cliente o al Usuario? Son cosas distintas."

### Discutí escenarios concretos

Cuando se discutan relaciones de dominio, poné a prueba esas relaciones con escenarios
concretos. Inventá escenarios que exploren casos límite y obliguen al usuario a ser preciso
sobre los límites entre conceptos relacionados.

### Cruzá referencias con el código

Cuando el usuario diga cómo funciona algo, revisá si el código coincide. Si encontrás una
contradicción, señalala: "Tu código cancela Pedidos completos, pero recién dijiste que la
cancelación parcial es posible — ¿cuál es correcto?"

### Actualizá CONTEXT.md en línea

Cuando se resuelve un término, actualizá `CONTEXT.md` ahí mismo. No lo acumules para
después — capturalo en el momento. Usá el formato de
[CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).

`CONTEXT.md` debe estar completamente libre de detalles de implementación. No lo trates
como una spec, un borrador de trabajo ni un repositorio de decisiones de implementación. Es
un glosario y nada más.

### Ofrecé ADRs con moderación

Ofrecé crear un ADR solo cuando las tres condiciones se cumplan:

1. **Difícil de revertir** — el costo de cambiar de opinión después es significativo.
2. **Sorprendente sin contexto** — un lector futuro se va a preguntar "¿por qué lo hicieron
   así?".
3. **Resultado de un trade-off real** — había alternativas genuinas y se elegió una por
   razones concretas.

Si falta cualquiera de las tres, no ofrezcas el ADR. Usá el formato de
[ADR-FORMAT.md](./ADR-FORMAT.md).

</informacion-de-apoyo>
