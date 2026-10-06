# Qué va en el CLAUDE.md y qué va detrás de un puntero

El ejemplo es ficticio: una tienda en línea, «Tiendita», con un `CLAUDE.md` que fue
creciendo por acumulación.

## El archivo antes

```markdown
# CLAUDE.md

## Comandos
- `npm run dev` arranca el servidor en el puerto 3000
- `npm test` ejecuta Vitest
- `npm run lint` ejecuta ESLint

## Estructura
- `src/api/` endpoints · `src/dominio/` reglas de negocio · `src/ui/` componentes

## Pagos
Usamos Stripe y no Adyen porque Adyen exigía contrato anual y el volumen no lo
justificaba. Si el volumen supera 10.000 pedidos al mes habría que reevaluarlo. Los
webhooks de Stripe llegan duplicados a veces, así que cada handler debe ser idempotente.
Para añadir un método de pago: 1) crear el adaptador en `src/api/pagos/`, 2) registrarlo
en `metodos.ts`, 3) añadir el caso en el selector de la UI, 4) escribir el test de
contrato, 5) actualizar la tabla de comisiones en `docs/pagos.md`.

## Envíos
Los envíos internacionales no se calculan en el checkout sino en el panel de
administración; el cliente recibe el coste por correo. [dos párrafos más]

## Estilo
- Nombres de variables en español
- Sin comentarios que expliquen qué hace el código
- Los tests van junto al archivo, con sufijo `.test.ts`

## Historia
En 2024 migramos de Express a Fastify por el rendimiento... [tres párrafos]
```

## Qué se hace con cada bloque

| Bloque | Pregunta 1: ¿toda tarea? | Pregunta 2: ¿no se descubre barato? | Destino |
|---|---|---|---|
| Comandos | Sí | **No**: están en `package.json` | Fuera. Solo se deja si hay un comando no obvio (p. ej. un orden de arranque) |
| Estructura | Sí | **No**: un `ls src/` lo da | Fuera |
| Pagos: por qué Stripe y no Adyen | **No** | Sí | **ADR** `0004-usar-stripe-para-pagos.md`. En `CLAUDE.md`, una línea con el enlace |
| Pagos: los webhooks llegan duplicados | **No**: solo pagos | Sí | `src/api/pagos/CLAUDE.md` |
| Pagos: pasos para añadir un método | **No** | Sí | **Skill** `anadir-metodo-de-pago` |
| Envíos internacionales | **No** | Sí | `docs/envios.md`, con fila en el índice |
| Estilo: nombres en español | Sí | Sí: no se ve mirando un archivo | **Se queda** |
| Estilo: sin comentarios que expliquen el qué | Sí | Sí | **Se queda** |
| Estilo: tests junto al archivo | Sí | **No**: se ve en el árbol | Fuera |
| Historia de Express a Fastify | **No** | Sí | ADR, o el historial de git |

## El archivo después

```markdown
# CLAUDE.md
<!-- Techo: 7 KB. Medir con `wc -c CLAUDE.md` antes de añadir nada. -->

Tiendita: tienda en línea con API en Fastify y UI en React.

## Reglas que aplican a todo

- Nombres de variables en español: el equipo y el negocio hablan español, y mezclar
  idiomas en el código obliga a traducir mentalmente al leerlo.
- Sin comentarios que expliquen *qué* hace el código; solo el *porqué* cuando no es obvio.

## Dónde mirar

| Fuente | Qué fija |
|---|---|
| [`docs/INDEX.md`](docs/INDEX.md) | Punto de partida: qué documento responde cada pregunta |
| [`docs/decisions/`](docs/decisions/) | Por qué se decidió cada cosa; antes de cuestionar una decisión |
| `src/api/pagos/CLAUDE.md` | Reglas del módulo de pagos |

Antes de leer varios archivos en cascada, consulta el índice. Si no sabes dónde vive algo,
pregunta en lugar de abrirlo todo.
```

De unas 60 líneas a unas 20. Lo que se fue no se perdió: cada cosa está donde se
encuentra cuando hace falta, y el `CLAUDE.md` dice dónde.

## Cuándo dudar de este reparto

- **Una regla que «aplica a todo» pero solo en un 10 % de las tareas** va detrás de un
  puntero. La prueba no es «¿podría aplicar?» sino «¿aplica casi siempre?».
- **Un comando que un agente no adivinaría** (un orden de arranque, una variable de entorno
  obligatoria, una trampa conocida) sí se queda, aunque esté en un README: el agente no
  lee el README si nadie se lo dice.
- **Una regla con consecuencias graves si se olvida** (no tocar una carpeta generada, no
  commitear a `main`) se queda aunque falle la pregunta 1: es barata y evita un error caro.
