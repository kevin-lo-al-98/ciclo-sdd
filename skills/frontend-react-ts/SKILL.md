---
name: frontend-react-ts
description: Estándares para construir interfaces con React y TypeScript modernos (hooks, componentes de servidor, data fetching, estado, accesibilidad, testing). Úsala cuando el usuario pida crear, revisar o refactorizar componentes React, hable de "react", "jsx", "tsx", "hooks", "next.js", "vite", "tanstack query", "zustand", "context", "estado global", o trabaje en un proyecto con package.json que incluya react. No la uses para Angular, Astro o JS sin framework, que tienen sus propias skills.
---

# React + TypeScript

Actúa como frontend senior. El objetivo es código que otro desarrollador entienda sin
preguntarte nada: tipos que documenten, componentes que hagan una cosa, y estado que
viva en el sitio correcto.

## Cómo entregas

1. Estructura de archivos propuesta.
2. Código por archivo.
3. Las decisiones no obvias y su porqué.
4. Qué cambiarías si esto creciera.

## Tipado

**Nunca `any`.** Si no conoces el tipo, usa `unknown` y estrecha con una comprobación.
`any` desactiva el compilador justo donde más lo necesitas.

Tipa las props con `type`, no con `interface`, salvo que necesites extensión por
declaración. Las uniones y los tipos utilitarios se componen mejor con `type`.

```tsx
type ButtonProps = {
  variant: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
};
```

Prefiere uniones literales a `string`. `variant: string` acepta `'primry'`; la unión no.

**Modela los estados imposibles fuera del tipo.** Esto elimina bugs enteros:

```tsx
// Mal: permite isLoading y error a la vez, y data con isLoading
type State = { isLoading: boolean; data?: User[]; error?: Error };

// Bien: los estados son excluyentes por construcción
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User[] }
  | { status: 'error'; error: Error };
```

## Componentes

Un componente hace **una** cosa. Si el nombre necesita un "y" para describirlo, son dos.

Separa presentación de lógica: el componente que pinta no debe saber de dónde vienen
los datos. Esto permite probarlo sin montar la red y reutilizarlo con otra fuente.

Extrae a un hook (`useAlgo`) cuando la lógica con estado se repita o cuando el
componente pase de ~150 líneas. Los hooks personalizados son la unidad de reutilización
de React; los componentes envoltorio para compartir lógica ya no lo son.

## Estado: dónde vive

Súbelo lo mínimo posible. El orden en que debes considerarlo:

1. **Local** (`useState`) — por defecto.
2. **URL** (query params) — si debe sobrevivir a un refresco o compartirse por enlace:
   filtros, paginación, pestaña activa, búsqueda.
3. **Servidor** (TanStack Query, SWR, o el data fetching del framework) — todo lo que
   venga de una API. No lo copies a `useState`.
4. **Global** (Zustand, Jotai, Context) — solo lo verdaderamente transversal: sesión,
   tema, idioma.

El error más caro es tratar datos de servidor como estado global. La caché, la
revalidación y los estados de carga ya están resueltos en las librerías de data
fetching; reimplementarlos con `useEffect` + `useState` produce race conditions.

**`useEffect` no es para obtener datos.** Úsalo solo para sincronizar con algo externo
a React: suscripciones, listeners del DOM, temporizadores. Y devuelve siempre la
función de limpieza.

## Rendimiento

No optimices antes de medir. `memo`, `useMemo` y `useCallback` tienen coste propio y
la mayoría de las veces no compensan.

Cuando midas y haga falta, el orden correcto es: primero reduce el trabajo (menos
re-renders por estado mal colocado), luego memoiza. Memoizar un componente que
re-renderiza porque su estado vive demasiado arriba no arregla la causa.

## Accesibilidad

No es una fase posterior; es parte de escribir el componente.

- HTML semántico antes que `div` con rol. `<button>` ya es accesible; un `div` con
  `onClick` no responde al teclado.
- Todo input necesita `<label>` asociado. Un placeholder no es una etiqueta.
- El foco debe ser visible y el orden de tabulación, lógico.
- Estados de carga y error anunciados con `aria-live`, no solo visuales.
- Contraste mínimo 4.5:1 para texto normal.

## Estados de la UI

Toda vista que dependa de datos tiene cuatro estados, y los cuatro se diseñan:
**cargando**, **error**, **vacío**, **con datos**. El estado vacío es el que más se
olvida y el que peor se ve en producción.

## Testing

Prueba comportamiento, no implementación. Un test que rompe al renombrar un estado
interno es un test que estorba.

Usa Testing Library y consulta por rol o texto accesible (`getByRole`, `getByLabelText`)
antes que por `data-testid`. Si no puedes encontrar un elemento por su rol, suele ser
señal de que el componente no es accesible.
