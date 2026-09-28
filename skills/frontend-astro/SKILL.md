---
name: frontend-astro
description: Estándares para sitios con Astro (islas, renderizado estático vs servidor, content collections, directivas client:*, integraciones). Úsala cuando el usuario pida crear o revisar un sitio Astro, mencione "astro", "isla", "island", "content collection", "client:load", "client:visible", ".astro", o trabaje en un proyecto con astro.config.mjs. Para sitios de contenido, blogs, documentación o landings donde el rendimiento importe, considérala antes que React o Angular.
---

# Astro

Actúa como frontend senior en Astro. La idea central que gobierna todas las decisiones:
**Astro envía cero JavaScript por defecto**. Todo lo que hagas o preserva esa propiedad
o la rompe, y romperla es lo que convierte un sitio Astro en una SPA lenta con pasos
extra.

## Cómo entregas

1. Estructura de archivos.
2. Código por archivo.
3. Decisiones no obvias y su porqué.
4. Qué cambiarías al escalar.

## Cuándo Astro es la elección correcta

Encaja cuando el contenido manda: blogs, documentación, marketing, landings, catálogos,
portfolios. Cualquier sitio donde la mayoría de las páginas son sobre todo lectura.

No encaja para aplicaciones con estado denso y muy interactivas — un panel de
administración, un editor, un cliente de correo. Ahí una SPA con React o Angular es la
herramienta adecuada. Decir esto a tiempo ahorra una reescritura.

## Islas: el modelo mental

Un componente `.astro` se renderiza en el servidor y llega al navegador como HTML.
Solo los componentes de framework (React, Vue, Svelte…) con una directiva `client:*`
envían JavaScript.

Cada isla tiene coste: su JS, el del framework y la hidratación. Antes de crear una,
pregunta si eso puede resolverse con HTML y CSS. Un menú desplegable no necesita React;
`<details>` ya existe.

## Elegir la directiva

| Directiva | Cuándo | Coste |
|---|---|---|
| ninguna | El componente es estático | Cero JS |
| `client:visible` | Está por debajo del pliegue | Carga al aparecer |
| `client:idle` | Interactivo pero no urgente | Carga tras el arranque |
| `client:load` | Interactivo de inmediato y visible al entrar | Bloquea el arranque |
| `client:media` | Solo en un tamaño de pantalla | Condicional |
| `client:only` | Depende de APIs del navegador y no puede renderizarse en servidor | Sin HTML previo |

**`client:visible` es el que deberías usar casi siempre.** `client:load` es el que más
se abusa: reserva para lo que está en el primer viewport y necesita responder al
instante.

`client:only` desactiva el renderizado en servidor: la página llega vacía en ese hueco
y aparece con un salto. Úsalo solo cuando el componente realmente no pueda renderizarse
sin `window`.

## Estático o servidor

`output: 'static'` por defecto. Es lo más rápido y lo más barato de alojar.

Pasa a `'server'` solo cuando el contenido dependa de la petición: sesión de usuario,
datos que cambian por minuto, personalización. Si dudas, empieza estático: pasar a
servidor después es fácil; volver atrás, no.

Con renderizado en servidor puedes marcar páginas concretas como prerenderizadas con
`export const prerender = true`. Mezclar ambos es normal y deseable.

## Content collections

Todo el contenido en Markdown o MDX va en colecciones con esquema. El esquema no es
burocracia: convierte un error de frontmatter en un fallo de build en lugar de una
página rota en producción.

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    publishedAt: z.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
```

Consulta con `getCollection()`, que devuelve datos ya tipados. Nunca leas los archivos
Markdown a mano.

## Compartir estado entre islas

Dos islas son dos aplicaciones distintas: no comparten estado de React ni de Angular.
Para comunicarlas, usa nanostores (la opción integrada, agnóstica del framework) o
eventos del DOM.

Si te descubres necesitando estado compartido entre muchas islas, es la señal de que
esa parte debería ser una sola isla — o de que la página entera debería ser una SPA.

## Rendimiento

- Usa el componente `<Image />` de Astro. Optimiza formato y tamaño, y reserva el
  espacio para evitar saltos de layout.
- `<ViewTransitions />` da navegación fluida sin convertir el sitio en SPA.
- Cada integración que añadas es JS. Revisa si compensa.
