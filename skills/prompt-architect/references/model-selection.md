# Selección de modelo — datos de referencia

Actualizado: 2026-09-28. Los precios y capacidades cambian; verifica en
https://docs.claude.com/en/docs/about-claude/models y
https://www.anthropic.com/pricing antes de tomar decisiones de coste importantes.

## Tabla de modelos

Precios en USD por millón de tokens, tarifa first-party de la API de Anthropic.

| Modelo | ID exacto | Contexto | Entrada | Salida |
|---|---|---|---|---|
| Claude Fable 5.1 | `claude-fable-5-1` | 1M | $10.00 | $50.00 |
| Claude Opus 5.5 | `claude-opus-5-5` | 1M | $4.00 | $20.00 |
| Claude Opus 5 | `claude-opus-5` | 1M | $5.00 | $25.00 |
| Claude Sonnet 5 | `claude-sonnet-5` | 1M | $2.00 | $10.00 |
| Claude Haiku 4.5 | `claude-haiku-4-5` | 200K | $1.00 | $5.00 |

Usa los IDs **tal cual**. No les añadas sufijos de fecha: `claude-opus-5`, nunca
`claude-opus-5-20260401`.

Bedrock y Vertex AI son plataformas de terceros con precios propios. Microsoft Foundry
factura a tarifa estándar de la API.

## Qué distingue a cada uno

### Haiku 4.5 — el barato
200K de contexto (el único que no llega a 1M). Para tareas mecánicas: extraer datos,
clasificar, formatear, generar mensajes de commit, transformaciones repetitivas sobre
muchos archivos. Es el único de la lista que todavía usa `budget_tokens` para el
razonamiento extendido y **no acepta el parámetro `effort`**.

### Sonnet 5 — el de trabajo
El punto por defecto para desarrollo real: features, refactors, tests, bugs acotados,
revisión de código rutinaria. 1M de contexto y razonamiento adaptativo. A $2/$10 cuesta
la mitad que Opus 5.5 en entrada y la mitad en salida.

### Opus 5.5 — el que razona
Para cuando equivocarse sale caro: arquitectura, migraciones, esquemas de datos, bugs
difíciles de reproducir, decisiones que van a condicionar meses de trabajo. Nota
importante: **su esfuerzo por defecto es `medium`**, un nivel por debajo del de Opus 5.
Si vienes de Opus 5 y notas respuestas menos profundas, sube el esfuerzo explícitamente.

Es más barato que Opus 5 ($4/$20 frente a $5/$25) con el mismo contexto y capacidades.

### Fable 5.1 — el más capaz
Para razonamiento exigente y trabajo agéntico de horizonte largo. A $10/$50 es el más
caro de la lista, por encima incluso de la gama Opus. Resérvalo para lo que Opus no
resolvió, o para tareas autónomas largas donde el modelo trabaja sin supervisión.

Su razonamiento está siempre activo y no se puede desactivar; la profundidad se regula
solo con el esfuerzo.

## El parámetro de esfuerzo

`output_config: {effort: "low" | "medium" | "high" | "xhigh" | "max"}`

Regula cuánto razona el modelo y, por tanto, cuánto gasta. Es la primera palanca de
coste que debes tocar, antes de pensar en cambiar de modelo.

- `low` — subagentes, tareas simples, alto volumen, rutas sensibles a la latencia.
- `medium` — ahorro razonable cuando la calidad aguanta. Es el valor por defecto de
  Opus 5.5.
- `high` — trabajo sensible a la calidad. Suele ser el mejor equilibrio.
- `xhigh` — la mejor opción para la mayoría del trabajo de programación y agéntico.
- `max` — cuando la corrección importa más que el coste.

Haiku 4.5 no lo acepta. El resto de los modelos de la tabla, sí.

**La idea que más dinero ahorra:** un modelo nuevo con esfuerzo bajo suele igualar o
superar a un modelo de generación anterior con esfuerzo alto. Antes de montar una
cascada de modelos para abaratar, mide el modelo capaz con esfuerzo reducido — y ten
en cuenta que la caché de prompts se asocia a un modelo concreto, así que repartir el
trabajo entre varios modelos renuncia a reutilizarla.

## Cómo medir el coste de verdad

Mide **coste por tarea terminada**, no por petición. Una petición barata que necesita
tres reintentos y cinco turnos extra no es barata. Este es el error de contabilidad más
común al comparar modelos.

## Cambiar de modelo en Claude Code

`/model` cambia el modelo de la sesión. `/fast` activa el modo rápido, que ejecuta
Claude Opus con mayor velocidad de salida — no baja a un modelo menor, pero tiene
precio premium.
