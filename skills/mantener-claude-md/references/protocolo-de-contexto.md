# Protocolo de contexto: índice primero, documento después

Un `CLAUDE.md` corto solo funciona si el agente tiene adónde ir. El mecanismo son dos
piezas: un **índice** y una **instrucción** en `CLAUDE.md` que lo pone en uso.

## El índice

Ubicación habitual: `docs/INDEX.md`. Una fila por documento, con tres columnas:

```markdown
# Índice de la documentación

| Documento | Para qué | Traer cuando |
|---|---|---|
| [`docs/envios.md`](envios.md) | Cómo se calcula el coste de envío | Tocar el checkout, el panel de administración o las tarifas |
| [`docs/decisions/0004-usar-stripe-para-pagos.md`](decisions/0004-usar-stripe-para-pagos.md) | Por qué Stripe y no Adyen | Cambiar de pasarela de pago o cuestionar su elección |
```

La columna que hace funcionar el índice es **«Traer cuando»**. «Para qué» describe el
documento; «Traer cuando» describe **la tarea que lo necesita**, que es lo único que el
agente conoce antes de abrirlo.

| Débil | Mejor |
|---|---|
| «Información sobre pagos» | «Tocar la integración con la pasarela, los webhooks o las comisiones» |
| «Decisiones de base de datos» | «Añadir una tabla, cambiar un índice o elegir otro motor» |
| «Documentación general» | No lo pongas: un documento que se trae «siempre» debería estar en `CLAUDE.md` |

Un disparador que no nombra una tarea concreta no dispara nada, y el documento queda
muerto aunque esté en el índice.

### Mantener el índice

Hay dos maneras, y la segunda es la buena cuando existe:

- **A mano.** Se actualiza en el mismo cambio que añade, mueve o borra el documento. Sin
  un validador, deriva: la señal es un documento que no aparece en el índice o un enlace
  que ya no resuelve. Pídelo en la revisión de cada cambio que mueva documentación.
- **Proyectado.** Si los ADRs llevan `trigger` en su frontmatter, las filas de decisiones se
  copian de ahí y no se redactan a mano. La fuente de verdad queda junto a la decisión.

## La instrucción en `CLAUDE.md`

Tres frases bastan. Esta es la versión base; adáptala al idioma y al tono del proyecto:

```markdown
## Protocolo de contexto

Antes de leer varios archivos en cascada, consulta [`docs/INDEX.md`](docs/INDEX.md) y
salta directo al documento que responde tu pregunta. Para barridos por muchos archivos,
delega en el subagente Explore. Si no sabes dónde vive un dato o una decisión, pregunta
en lugar de abrirlo todo.
```

Cada frase tiene su razón:

- **Índice antes que cascada**: leer cinco archivos para encontrar uno cuesta cuatro
  lecturas que el índice evitaba.
- **Explore para barridos**: un subagente devuelve la conclusión sin volcar en la
  conversación principal los archivos que leyó para llegar a ella.
- **Preguntar antes de abrirlo todo**: una pregunta de diez segundos al usuario sale más
  barata que decenas de miles de tokens de lectura a ciegas, y suele acertar más.

## Un índice por zona

En un monorepo con `CLAUDE.md` por área, cada área puede tener su propio índice
(`<area>/docs/INDEX.md`) y el raíz enlazarlos en una tabla «Índice por área». El raíz
despacha; cada área detalla. Así el agente que trabaja en una zona no paga el índice de
las demás.

## Límites

- Un índice grande vuelve a ser un problema de contexto: si pasa de unas pocas decenas de
  filas, divídelo por zona.
- El protocolo no se puede verificar como comportamiento: nada obliga al agente a
  consultar el índice. Lo que sí se puede es impedir el fallo caro (leer entero un archivo
  enorme); para eso, ver [`hook-lectura-pesada.md`](hook-lectura-pesada.md).
