# Plantillas de prompt por tipo de tarea

Cada plantilla es un punto de partida, no un formulario. Borra lo que no aplique:
un prompt con secciones vacías es peor que uno corto.

## Feature nueva

```
Objetivo: <qué debe existir y funcionar cuando termines>

Contexto:
- Stack: <framework + versión, runtime, gestor de paquetes>
- Dónde vive: <rutas o módulos relevantes>
- Se integra con: <API, tabla, componente existente>

Criterio de terminado:
- <comportamiento observable 1>
- <test que debe pasar>

No toques: <archivos, módulos o patrones fuera de alcance>
```

## Bug

Lo que hace útil un prompt de bug es la **reproducción**, no la descripción. Si no
sabes reproducirlo, dilo explícitamente: cambia la tarea de "arréglalo" a
"diagnostícalo", que es un trabajo distinto.

```
Síntoma: <qué ves>
Esperado: <qué debería pasar>

Reproducción:
1. <paso>
2. <paso>

Entorno: <versiones, navegador, SO, datos de ejemplo>
Ya descarté: <lo que comprobaste, para que no lo repita>

Error literal:
<pega el stack trace completo, sin recortar>
```

`Ya descarté` es la línea que más tiempo ahorra: evita que el modelo repita tu camino.

## Refactor

```
Código actual: <ruta>
Problema: <por qué molesta hoy — acoplamiento, duplicación, ilegible>
Resultado buscado: <la propiedad que quieres, no la técnica concreta>

Invariante: el comportamiento externo no cambia.
Cómo se verifica: <tests existentes, o "no hay tests, propón cómo asegurarlo">

Alcance: solo <X>. No aproveches para <Y>.
```

La línea de alcance es la importante. Sin ella, un refactor tiende a expandirse.

## Revisión de código

```
Revisa <diff | rama | ruta> buscando: <corrección | seguridad | rendimiento | legibilidad>

Contexto: <qué hace este código y quién lo consume>
Prioriza: <lo que más te preocupa>
Ignora: <estilo, formato, lo que ya cubre el linter>

Por cada hallazgo: archivo:línea, qué falla, y el caso concreto que lo rompe.
```

Pedir el caso concreto que rompe filtra los hallazgos especulativos.

## Migración

```
De: <origen + versión>   A: <destino + versión>
Alcance: <archivos o módulos exactos>

Restricciones:
- <compatibilidad que hay que mantener>
- <qué no puede romperse durante la transición>

Estrategia: <de golpe | por fases>. Si es por fases, di dónde parar en cada una.
Verificación: <cómo se comprueba cada fase>
```

Nunca lances una migración sin delimitar el alcance. "Migra el proyecto" es ambiguo:
dice qué hacer pero no dónde.

## Exploración / entender código

```
Quiero entender <qué>, para <objetivo: modificarlo, revisarlo, documentarlo>.

Empieza por: <punto de entrada si lo sabes>
Responde: <las 2-3 preguntas concretas que tienes>

No cambies nada todavía.
```

`No cambies nada todavía` separa entender de actuar. Sin esa línea, es fácil acabar
con un diff que no pediste.

---

# Antipatrones

**Pedir a trozos.** Enviar la tarea incompleta y añadir requisitos después. Cada
requisito tardío invalida decisiones ya tomadas. Escribe el prompt entero antes de
enviarlo.

**Micro-dirigir.** Listas de pasos detallados que le quitan al modelo el margen de
elegir un camino mejor. Con los modelos actuales esto empeora el resultado. Describe
el destino y las restricciones reales, no el itinerario.

**Contexto implícito.** "Arregla el login" sin decir qué stack, qué archivo ni qué
falla. El modelo rellenará los huecos con suposiciones que no son tu proyecto.

**Recortar el error.** Pegar solo la primera línea del stack trace. La causa suele
estar en medio.

**Cortesía como instrucción.** "Si pudieras, quizá revisar..." Sé directo: la
ambigüedad educada se interpreta como opcional.

**Varias tareas en un prompt.** Arreglar un bug, añadir un test y refactorizar de paso.
Se hacen las tres a medias. Una tarea por prompt.

**Confundir prompt malo con modelo insuficiente.** Si el modelo pide aclaraciones
sobre algo que ya estaba escrito, el problema es la redacción. Subir de modelo no
arregla un prompt ambiguo, solo lo hace más caro.
