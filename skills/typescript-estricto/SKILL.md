---
name: typescript-estricto
description: Cómo satisfacer el perfil estricto del compilador de TypeScript sin relajarlo. Úsala cuando el compilador rechace algo y haya que decidir entre arreglar el tipo o bajar un flag; cuando aparezca un `any`, un `as any`, un `@ts-ignore`, un error de `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `isolatedModules` o `noPropertyAccessFromIndexSignature`; cuando el usuario pregunte "¿esto pasa strict?", "¿necesito un any aquí?", "por qué me pide corchetes", "cómo tipo esto que viene de fuera"; o cuando haya que activar `strict` en un proyecto que no lo tenía. No la uses para decidir la forma del código —factorización, estado, componentes—: eso va en las skills de frontend o backend correspondientes.
---

# TypeScript estricto

El perfil estricto no es rigor por gusto: cada flag apagado mueve una clase de error
del compilador al runtime. `strictNullChecks` apagado no elimina los `undefined`, solo
hace que aparezcan en producción. Por eso la regla de fondo de esta skill es una: **el
flag no se baja para desbloquear un cambio.** Si algo no compila, el arreglo es el
tipo, no la configuración.

## Los flags y qué obligan

| Flag | Qué obliga |
|---|---|
| `strict: true` | Paraguas de los siguientes. Sin `any` implícito; `null` y `undefined` se manejan explícitos (`strictNullChecks`) |
| `noImplicitOverride` | Un método que sobrescribe al de la clase base lleva `override` |
| `noPropertyAccessFromIndexSignature` | Una propiedad que viene de una *index signature* se lee con `obj['clave']`, no `obj.clave` |
| `noImplicitReturns` | Si la función devuelve algo, **todas** sus ramas devuelven |
| `noFallthroughCasesInSwitch` | Cada `case` con código termina en `break`, `return` o `throw` |
| `isolatedModules` | Lo que solo es un tipo se importa y reexporta con `import type` / `export type` |
| `noUncheckedIndexedAccess` | Indexar un array o un record devuelve `T \| undefined` |
| `exactOptionalPropertyTypes` | `{ a?: string }` no acepta `{ a: undefined }` explícito |

Los dos últimos no entran en `strict` y son los que más deuda destapan en un proyecto
existente. Actívalos si el proyecto ya está limpio con el resto; ver la sección de
adopción gradual si no lo está.

**Donde vive la configuración importa.** En un monorepo o workspace, los flags van en
el `tsconfig.json` raíz que los demás extienden. Un flag bajado en el `tsconfig` de un
proyecto concreto es invisible en revisión: el archivo raíz sigue diciendo `strict`, y
nadie mira los 12 archivos que lo extienden.

## Los cinco errores que explican casi todos los casos

**`any` para callar al compilador.** La alternativa no es tipar de más, es `unknown` y
estrechar. `any` desactiva la comprobación hacia dentro *y* hacia fuera: todo lo que
toque ese valor deja de verificarse también.

```ts
// ❌
function leerNombre(x: any) { return x.nombre; }

// ✅
function leerNombre(x: unknown): string {
  if (typeof x === 'object' && x !== null && 'nombre' in x) {
    return String((x as { nombre: unknown }).nombre);
  }
  throw new Error('forma inesperada');
}
```

**Rama sin `return`.** El compilador no te está pidiendo un `return` cualquiera: te
está diciendo que no cubriste un caso. La salida buena es hacer el `switch` exhaustivo
con el truco de `never`, que además falla al compilar el día que alguien añada un valor
nuevo al tipo:

```ts
function etiqueta(c: Criticidad): string {
  switch (c) {
    case 'alta': return 'Alta';
    case 'media': return 'Media';
    case 'baja': return 'Baja';
    default: { const exhaustivo: never = c; throw new Error(exhaustivo); }
  }
}
```

**Tipo importado como valor.** Con `isolatedModules`, cada archivo se transpila por
separado y el compilador no puede saber si `Usuario` era un tipo o algo que existe en
runtime. De ahí la obligación de marcarlo:

```ts
// ❌
import { crearUsuario, Usuario } from './modelos';
export { Usuario } from './modelos';

// ✅
import { crearUsuario } from './modelos';
import type { Usuario } from './modelos';
export type { Usuario } from './modelos';
```

**Acceso con punto a una index signature.** `config.timeout` sobre
`Record<string, number>` compila con el flag apagado y devuelve `undefined` si la clave
no está. Los corchetes son el recordatorio de que esa clave es un dato, no una
propiedad conocida.

**`override` implícito.** Sin la palabra clave, el día que la clase base renombre el
método el hijo deja de sobrescribir nada y sigue compilando: el código queda muerto sin
un solo error.

## Las tres válvulas de escape, y su precio

- **`unknown` + narrowing** — la vía normal para datos que entran de fuera (respuestas
  HTTP, `JSON.parse`, mensajes de otro contexto). Cuesta unas líneas y no miente.
- **Un *type guard* o un validador de esquema** (Zod, Valibot) en el borde — lo correcto
  cuando el dato externo es una estructura, no un valor suelto. Un guard mal escrito
  miente igual que un `as`, con la diferencia de que está en un solo sitio y se puede
  probar.
- **`as` / `@ts-expect-error`** — último recurso, y siempre con un comentario que diga
  *por qué* el compilador se equivoca aquí. Usa `@ts-expect-error`, nunca
  `@ts-ignore`: el primero falla si el error desaparece, así que se limpia solo cuando
  la causa se arregla; el segundo se queda para siempre.

## Si el proyecto es Angular

A los flags de TypeScript se suman los de plantilla, en `angularCompilerOptions`:

- `strictTemplates` — un `[input]` con tipo incompatible o una propiedad que no existe
  en el componente es error de compilación, no un `undefined` silencioso en pantalla.
- `strictInjectionParameters` — los parámetros inyectados van tipados.
- `strictInputAccessModifiers` — un `input()` declarado `protected` o `private` **no se
  puede bindear desde el padre**. Si el padre tiene que escribirlo, es público. El
  error que da es confuso: parece un problema de plantilla y es de visibilidad.

## Adopción gradual en un proyecto que no lo tenía

Activar `strict: true` de golpe en un proyecto grande produce cientos de errores, y la
reacción previsible es volver a apagarlo. El orden que funciona:

1. Mide antes de decidir: `tsc --noEmit --strict` sobre el estado actual y cuenta los
   errores por flag (`strictNullChecks` suele ser el 80 %).
2. Activa los flags uno a uno, cada uno en su propio cambio, empezando por los baratos
   (`noImplicitOverride`, `noFallthroughCasesInSwitch`, `noImplicitReturns`).
3. `strictNullChecks` al final y por áreas si hace falta, nunca a la vez que otro.
4. No uses `// @ts-nocheck` como paso intermedio: apaga el archivo entero, incluidos
   los errores que sí estaban arreglados.

## El cierre

Un cambio no está listo sin una comprobación de tipos limpia del proyecto tocado:
`tsc --noEmit` (o el build/test del framework, que la ejecuta por dentro). El editor no
cuenta: usa el servicio de lenguaje sobre los archivos abiertos, no el proyecto
completo, y no ve los `tsconfig` de los demás proyectos del workspace.

## Qué NO hacer

- Bajar un flag —en el `tsconfig` raíz o en uno por proyecto— para que pase un cambio.
- `any` o `as any` sin una razón escrita en el propio código o en la descripción del PR.
- `@ts-ignore`, y `@ts-expect-error` sin comentario que lo justifique.
- Tipar una respuesta HTTP con una interfaz y dar por hecho que el servidor la cumple:
  `response.json()` devuelve `any` y esa interfaz es una promesa, no una comprobación.
- Dar el cambio por cerrado porque el editor no marca nada en rojo.
