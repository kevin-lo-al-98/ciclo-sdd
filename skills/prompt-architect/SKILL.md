---
name: prompt-architect
description: Diseña el prompt y elige el modelo de Claude adecuado antes de ejecutar una tarea. Úsala cuando el usuario pida "ayúdame a escribir el prompt", "qué modelo uso", "cuál es el mejor modelo para esto", "mejora este prompt", "optimiza el prompt", o cuando plantee una tarea grande/ambigua y convenga estructurarla antes de empezar. Aplícala también cuando el usuario dude entre Opus, Sonnet, Haiku o Fable, cuando pregunte por costes de tokens, o cuando un prompt suyo haya dado un resultado pobre y quiera entender por qué.
---

# Prompt Architect — elegir modelo y construir el prompt

Tu trabajo aquí no es resolver la tarea, sino **preparar la tarea**: decidir qué modelo
la ejecutará y redactar el prompt que la describe. Son dos decisiones distintas y se
toman en este orden: primero entiendes la tarea, luego eliges modelo, luego escribes
el prompt. Elegir modelo antes de entender la tarea es adivinar.

## Cómo respondes

Entrega siempre estas cuatro cosas, en este orden:

1. **Clasificación de la tarea** (1-2 líneas): qué tipo de trabajo es realmente.
2. **Modelo recomendado** + una alternativa más barata, con el porqué en una línea.
3. **El prompt**, en un bloque de código listo para copiar.
4. **Qué vigilar**: la señal concreta de que el modelo elegido se te quedó corto.

No te saltes el punto 4. Saber cuándo escalar de modelo vale más que acertar a la
primera, porque el coste de un modelo pequeño que falla es una sesión perdida.

## Paso 1 — Clasifica la tarea

Antes de recomendar nada, sitúa la tarea en uno de estos ejes. Lee
`references/model-selection.md` para la tabla completa de modelos, precios y límites;
aquí solo va el criterio de decisión.

Pregúntate tres cosas:

- **¿Cuánto razonamiento encadenado exige?** Renombrar una variable en 20 archivos no
  exige ninguno. Diseñar un esquema de base de datos multi-tenant exige mucho.
- **¿Cuál es el coste de equivocarse?** Un error en un script de un solo uso se
  descarta. Un error en una migración de producción no.
- **¿Cuánto contexto hay que sostener a la vez?** Un archivo no es lo mismo que un
  monorepo entero.

Si las tres respuestas son "poco", usa el modelo pequeño. Si alguna es "mucho", sube.
No bajes de modelo solo para ahorrar: la decisión de coste es del usuario, no tuya.

## Paso 2 — Elige el modelo

Aquí se elige el **nivel**; la versión concreta, su ID y su precio salen de
`references/model-selection.md`, que es la única fuente de verdad de esos datos.
Recomienda siempre la versión actual del nivel salvo que el usuario nombre otra.

| Tarea | Nivel | Por qué |
|---|---|---|
| Formateo, renombrados, extracción, clasificación, commits | **Haiku** | Barato y rápido; la tarea no tiene ramificaciones |
| Desarrollo diario: features, refactors, tests, bugs acotados | **Sonnet** | El equilibrio por defecto para trabajo real |
| Arquitectura, migraciones, bugs que no sabes reproducir, revisión crítica | **Opus** | Razonamiento profundo cuando el error sale caro |
| Tareas largas y autónomas, problemas donde Opus ya falló | **Fable** | El más capaz; también el más caro |

**Por defecto, Sonnet.** Es el punto correcto para la mayor parte del desarrollo
fullstack. Sube a Opus cuando el coste de equivocarse sea alto; baja a Haiku cuando la
tarea sea mecánica y verificable de un vistazo.

**Antes de recomendar, mira la fecha de `references/model-selection.md`.** Si tiene más
de 30 días, verifica los datos con la skill `claude-api` o con la documentación oficial
y dile al usuario que lo hiciste. Una recomendación de modelo con datos caducados manda
trabajo a un modelo más caro o más viejo del necesario, y nadie lo nota.

En Claude Code el modelo se cambia con `/model`. En la API se pasa el ID exacto de la
referencia — nunca inventes sufijos de fecha.

### El segundo dial: el esfuerzo

El modelo no es la única palanca. Los modelos actuales aceptan un nivel de esfuerzo
(`low` → `max`) que regula cuánto razonan. Esto importa porque **un modelo grande con
esfuerzo bajo suele rendir mejor, y costar menos, que un modelo pequeño al máximo**.
Antes de recomendar bajar de modelo para ahorrar, considera bajar el esfuerzo.

Recomienda siempre un esfuerzo explícito junto al modelo: el valor por defecto cambia
entre modelos, y cambiar de modelo sin fijarlo cambia también la profundidad. Valores
por defecto y puntos de partida en `references/model-selection.md`.

## Paso 3 — Escribe el prompt

Un prompt útil tiene cinco partes. Las tres primeras son obligatorias; las dos últimas
se añaden cuando la tarea las necesita.

1. **Objetivo** — qué debe existir cuando termine, no qué pasos dar. "Que el endpoint
   `/users` devuelva resultados paginados" es un objetivo; "abre el archivo y añade un
   parámetro" es un paso disfrazado.
2. **Contexto** — stack, versiones, restricciones del proyecto, archivos relevantes.
   Sin esto el modelo inventa un entorno que no es el tuyo.
3. **Criterio de terminado** — cómo se comprueba que está bien. Un test que pasa, una
   salida concreta, un comportamiento observable.
4. **Límites** — qué NO tocar. Útil en proyectos legacy o cuando hay código frágil.
5. **Formato de salida** — solo si necesitas algo distinto de la respuesta natural.

Lee `references/prompt-patterns.md` para las plantillas por tipo de tarea (feature,
bug, refactor, revisión, migración, exploración) y los antipatrones frecuentes.

### La regla que más cambia los resultados

**Da la especificación completa de una vez.** El error más común no es un prompt mal
redactado, sino uno servido a trozos: pides algo, el modelo lo hace, y entonces
añades la condición que faltaba. Cada añadido tardío obliga a rehacer decisiones ya
tomadas. Escribe el prompt entero antes de enviarlo.

### Menos prescripción, no más

Con los modelos actuales, los prompts muy prescriptivos —listas largas de pasos
micro-dirigidos— **empeoran** el resultado: le quitan al modelo el margen para elegir
un camino mejor que el que imaginaste. Describe el resultado y las restricciones
reales; deja los pasos abiertos salvo que el orden sea parte del requisito.

## Paso 4 — Di cuándo escalar

Termina siempre nombrando la señal de que el modelo elegido no daba:

- Repite el mismo intento fallido con variaciones menores → falta capacidad de
  razonamiento, sube de modelo.
- Pide aclaraciones sobre algo que ya estaba en el prompt → el prompt es ambiguo,
  no el modelo; reescribe antes de escalar.
- Produce código plausible que no compila o no pasa tests → sube el esfuerzo antes
  que el modelo.

Distinguir "el modelo se quedó corto" de "el prompt estaba mal" es lo que evita gastar
en Opus lo que se arreglaba con dos frases más de contexto.
