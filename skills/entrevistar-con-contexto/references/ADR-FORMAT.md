# Formato de ADR

> Nota: si el proyecto ya usa la skill `documentar-decisiones` (ADRs en formato MADR en
> `docs/decisions/`), seguí esa convención en su lugar — este formato mínimo es para cuando
> `entrevistar-con-contexto` se usa sin esa skill y el proyecto todavía no tiene un formato
> de ADR propio.

Los ADR viven en `docs/adr/` y usan numeración secuencial: `0001-slug.md`, `0002-slug.md`,
etc.

Creá el directorio `docs/adr/` de forma perezosa — solo cuando haga falta el primer ADR.

## Plantilla

```md
# {Título corto de la decisión}

{1-3 frases: cuál es el contexto, qué se decidió, y por qué.}
```

Y ya. Un ADR puede ser un solo párrafo. El valor está en registrar *que* se tomó una
decisión y *por qué* — no en completar secciones.

## Secciones opcionales

Incluilas solo cuando aporten valor genuino. La mayoría de los ADR no las van a necesitar.

- Frontmatter de **estado** (`proposed | accepted | deprecated | superseded by ADR-NNNN`) —
  útil cuando las decisiones se revisan después.
- **Opciones consideradas** — solo cuando las alternativas rechazadas valen la pena
  recordarlas.
- **Consecuencias** — solo cuando haya efectos secundarios no obvios que señalar.

## Numeración

Buscá en `docs/adr/` el número más alto existente e incrementalo en uno.

## Cuándo ofrecer un ADR

Las tres condiciones siguientes tienen que ser verdaderas:

1. **Difícil de revertir** — el costo de cambiar de opinión después es significativo.
2. **Sorprendente sin contexto** — un lector futuro va a mirar el código y preguntarse "¿por
   qué lo hicieron así?".
3. **Resultado de un trade-off real** — había alternativas genuinas y se elegió una por
   razones concretas.

Si una decisión es fácil de revertir, salteala — simplemente se revierte. Si no es
sorprendente, nadie se va a preguntar por qué. Si no había una alternativa real, no hay nada
que registrar más allá de "hicimos lo obvio".

### Qué califica

- **Forma arquitectónica.** "Usamos un monorepo." "El modelo de escritura es event-sourced,
  el de lectura se proyecta a Postgres."
- **Patrones de integración entre contextos.** "Pedidos y Facturación se comunican por
  eventos de dominio, no por HTTP síncrono."
- **Elecciones de tecnología que implican lock-in.** Base de datos, bus de mensajes,
  proveedor de autenticación, destino de despliegue. No cada librería — solo las que
  tomarían un trimestre reemplazar.
- **Decisiones de límite y alcance.** "Los datos de Cliente son propiedad del contexto
  Cliente; otros contextos los referencian solo por ID." Los "no" explícitos valen tanto
  como los "sí".
- **Desviaciones deliberadas del camino obvio.** "Usamos SQL manual en vez de un ORM por
  X." Cualquier cosa donde un lector razonable asumiría lo contrario. Esto evita que la
  próxima persona "arregle" algo que era deliberado.
- **Restricciones que no son visibles en el código.** "No podemos usar AWS por requisitos
  de cumplimiento." "Los tiempos de respuesta tienen que estar bajo 200ms por el contrato
  con la API de un socio."
- **Alternativas rechazadas cuando el rechazo no es obvio.** Si consideraste GraphQL y
  elegiste REST por razones sutiles, registralo — si no, alguien va a volver a sugerir
  GraphQL dentro de seis meses.
