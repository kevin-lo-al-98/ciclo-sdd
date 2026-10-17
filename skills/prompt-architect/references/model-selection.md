# Selección de modelo — datos de referencia

Actualizado: 2026-10-17, verificado contra la skill `claude-api` (datos del
2026-10-06). Los precios y capacidades cambian; verifica en
https://docs.claude.com/en/docs/about-claude/models y
https://www.anthropic.com/pricing antes de tomar decisiones de coste importantes.

Este archivo es la única fuente de verdad de IDs, precios y valores por defecto. El
`SKILL.md` y las demás skills hablan de niveles (Haiku, Sonnet, Opus, Fable) y remiten
aquí, para que un lanzamiento nuevo se actualice en un solo sitio.

## Versión actual de cada nivel

Precios en USD por millón de tokens, tarifa first-party de la API de Anthropic.

| Nivel | Modelo actual | ID exacto | Contexto | Entrada | Salida | Esfuerzo por defecto |
|---|---|---|---|---|---|---|
| Haiku | Claude Haiku 5.5 | `claude-haiku-5-5` | 1M | $0.10 | $0.50 | `medium` |
| Sonnet | Claude Sonnet 5.5 | `claude-sonnet-5-5` | 1M | $2.00 | $10.00 | `high` |
| Opus | Claude Opus 5.5 | `claude-opus-5-5` | 1M | $4.00 | $20.00 | `medium` |
| Fable | Claude Fable 5.1 | `claude-fable-5-1` | 1M | $10.00 | $50.00 | `high` |

Haiku 5.5 cuesta lo indicado con prompts de hasta 100K tokens; por encima, $0.50 /
$2.50.

Recomienda siempre el modelo actual del nivel. Los de la generación anterior siguen
disponibles, pero solo tienen sentido si el usuario los nombra o su código ya los usa:

| Modelo anterior | ID | Contexto | Entrada | Salida | Diferencia que importa |
|---|---|---|---|---|---|
| Claude Haiku 4.5 | `claude-haiku-4-5` | 200K | $1.00 | $5.00 | No acepta `effort`; usa `budget_tokens`. Diez veces más caro que Haiku 5.5 |
| Claude Sonnet 5 | `claude-sonnet-5` | 1M | $2.00 | $10.00 | Mismo precio que Sonnet 5.5 |
| Claude Opus 5 | `claude-opus-5` | 1M | $5.00 | $25.00 | Más caro que Opus 5.5; esfuerzo por defecto `high` |
| Claude Fable 5 | `claude-fable-5` | 1M | $10.00 | $50.00 | Mismo precio que Fable 5.1 |

Usa los IDs **tal cual**. No les añadas sufijos de fecha: `claude-opus-5-5`, nunca
`claude-opus-5-5-20260401`.

Bedrock y Vertex AI son plataformas de terceros con precios propios. Microsoft Foundry
factura a tarifa estándar de la API.

## Qué distingue a cada nivel

### Haiku — el barato
Para tareas mecánicas: extraer datos, clasificar, formatear, generar mensajes de
commit, transformaciones repetitivas sobre muchos archivos. Haiku 5.5 tiene 1M de
contexto y acepta el esfuerzo; su valor por defecto es `medium`, y para trabajo
mecánico basta `low`. A su precio, cuesta poco probarlo antes de descartarlo.

### Sonnet — el de trabajo
El punto por defecto para desarrollo real: features, refactors, tests, bugs acotados,
revisión de código rutinaria. Cuesta la mitad que Opus 5.5.

En Sonnet 5.5 los niveles de esfuerzo están recalibrados respecto a Sonnet 5: empieza en
`medium` para programación con agentes y tareas de varias herramientas, y en `low` para
conversación. Si vienes de Sonnet 5 con `xhigh`, vuelve a medir.

### Opus — el que razona
Para cuando equivocarse sale caro: arquitectura, migraciones, esquemas de datos, bugs
difíciles de reproducir, decisiones que van a condicionar meses de trabajo.

Opus 5.5 es el Opus actual y es más barato que Opus 5 ($4/$20 frente a $5/$25). Dos
cosas a avisar al recomendarlo:

- **Su esfuerzo por defecto es `medium`**, un nivel por debajo del de Opus 5. Si el
  usuario viene de Opus 5 y nota respuestas menos profundas, que lo suba explícitamente.
- Su razonamiento no se puede desactivar; la profundidad se regula solo con el esfuerzo.

### Fable — el más capaz
Para razonamiento exigente y trabajo agéntico de horizonte largo. A $10/$50 es el más
caro, por encima de la gama Opus. Resérvalo para lo que Opus no resolvió, o para tareas
autónomas largas donde el modelo trabaja sin supervisión. Una sola petición difícil
puede tardar varios minutos.

Su razonamiento está siempre activo; la profundidad se regula solo con el esfuerzo.

## El parámetro de esfuerzo

`output_config: {effort: "low" | "medium" | "high" | "xhigh" | "max"}`

Regula cuánto razona el modelo y, por tanto, cuánto gasta. Es la primera palanca de
coste que debes tocar, antes de pensar en cambiar de modelo. Todos los modelos actuales
lo aceptan; de los anteriores, Haiku 4.5 no.

- `low` — subagentes, tareas simples, alto volumen, rutas sensibles a la latencia.
- `medium` — ahorro razonable cuando la calidad aguanta. Es el valor por defecto de
  Opus 5.5 y Haiku 5.5, y el punto de partida para programación con agentes en
  Sonnet 5.5.
- `high` — trabajo sensible a la calidad. Suele ser el mejor equilibrio, y es el valor
  por defecto de Sonnet 5.5 y Fable 5.1.
- `xhigh` — buen punto para programación y trabajo agéntico en Fable y Opus; en Sonnet
  5.5, súbelo hasta aquí solo si la medición lo justifica.
- `max` — cuando la corrección importa más que el coste.

Como el valor por defecto cambia entre modelos, **di siempre el esfuerzo que
recomiendas**, no lo dejes implícito: cambiar de modelo sin fijarlo cambia también la
profundidad del razonamiento.

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
Claude Opus con mayor velocidad de salida —no baja a un modelo menor— a precio premium:
en Opus 5.5, $8/$40, solo en la API de Claude.
