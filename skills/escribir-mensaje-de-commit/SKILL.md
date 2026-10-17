---
name: escribir-mensaje-de-commit
description: 'Redacta el mensaje de un commit y ejecuta el commit siguiendo Conventional Commits. Úsala cuando el usuario dé el trabajo por terminado —"listo", "ya está", "terminamos", "haz el commit", "commitea esto"— o pida ayuda con el texto ("cómo redacto este commit", "mejora este mensaje", "divide esto en commits"). Cubre el recorte en commits atómicos, el protocolo de aprobación antes de ejecutar `git commit`, la elección del alcance y qué hacer si estás en `main`. No la uses para revisar la calidad del cambio antes del PR, ni para redactar la descripción de un pull request: son tareas distintas.'
---

# Escribir mensaje de commit

Fija dos cosas: **cómo se redacta** el mensaje y **cómo se ejecuta** el commit. La
segunda pesa más de lo que parece. Un commit entra en la historia compartida del
repositorio, y deshacerlo después cuesta más que preguntar antes.

## Cuándo actúas

Preparas el commit solo si:

- el usuario dice explícitamente que terminó —"listo", "ya está", "dale con el
  commit"— **y** hay cambios sin commitear, o
- pide el commit directamente.

No commiteas a mitad de una conversación con varias peticiones encadenadas, ni "por
si acaso" al cerrar un subpaso. Si el trabajo quedó hecho pero el usuario no dijo
nada, **pregunta**; no lo prepares sin respuesta. El motivo es que tú no sabes si lo
que hay en el árbol de trabajo es el cambio completo o la mitad de una idea: commitear
a destiempo parte el cambio en dos y obliga a un `--amend` o a un commit de arreglo.

## Protocolo de aprobación

Nunca ejecutas `git add` + `git commit` sin visto bueno explícito. Un mensaje
equivocado sobrevive al cambio que describe: se lee en `git blame` durante años,
mientras el código que lo motivó ya se reescribió.

1. `git status` y `git diff` (más `git diff --staged` si ya hay algo en el índice).
2. Decide el **recorte**: un commit, un propósito. Si lo tocado cubre propósitos
   distintos, prepara N commits y presenta el plan completo.
3. Muestra en texto plano: qué archivos entran en cada commit y el **mensaje entero**
   de cada uno (título, cuerpo y pie). Si son varios, numerados y en orden.
4. **Espera aprobación.** Un "sí", "dale", "ok" basta. Silencio o un comentario
   ambiguo no es aprobación: vuelve a preguntar.
5. Con el visto bueno, ejecuta `git add` de los archivos acordados y `git commit`. Si
   son varios, en el orden presentado.
6. Muestra la salida de `git` y nada más.

**Excepción:** si el usuario pidió modo automático en *esta* tarea ("commitea sin
preguntar", "no me consultes el mensaje"), ejecuta directo. Vale para esa tarea y no
se hereda a la siguiente, porque un permiso dado una vez no es una política.

## El idioma del mensaje

Lo decide el repositorio, no tú. Mira `git log --oneline -20`: si la historia está en
español, escribes en español; si está en inglés, en inglés. Una historia bilingüe
obliga a todo el que la lea a cambiar de convención cada dos líneas.

El `<tipo>` y las palabras clave del pie (`feat`, `fix`, `BREAKING CHANGE`, `Closes`)
van **siempre en inglés**: son parte del formato, no del texto.

## Formato

```
<tipo>(<alcance opcional>): <descripción corta en imperativo>

[cuerpo opcional — el porqué y el contexto, no el cómo]

[pie opcional — referencias y breaking changes]
```

**Título:** una sola línea, **≤ 72 caracteres** (apunta a 50), sin punto final, verbo
en imperativo ("agregar", "corregir", "migrar"; no "agregado" ni "agrega"). El límite
no es estética: es el ancho que muestran `git log --oneline`, las listas de commits de
GitHub o GitLab y los avisos de CI. Lo que no entra, se corta.

| Tipo | Cuándo |
|---|---|
| `feat` | nueva capacidad para quien usa el producto |
| `fix` | corrección de un error |
| `docs` | solo documentación |
| `style` | formato sin cambio de significado (espacios, prettier, comas) |
| `refactor` | cambio de código que ni corrige un error ni añade capacidad |
| `perf` | cambio de código que mejora el rendimiento |
| `test` | añadir o corregir pruebas |
| `chore` | tooling, configuración, dependencias, tareas de build |
| `build` | el sistema de build o las dependencias externas |
| `ci` | pipelines y configuración de integración continua |

**Cuerpo:** separado del título por una línea en blanco, con salto a las 72 columnas.
Explica **por qué** se hizo el cambio. El cómo ya está en el diff; lo que no se puede
reconstruir dentro de seis meses es la razón.

**Pie:** referencias (`Refs #123`, `Closes #123`, `Refs PROJ-45`) y, si el cambio
rompe a sus consumidores, `feat(scope)!: …` en el título **y** un bloque
`BREAKING CHANGE: <qué se rompe y qué debe hacer quien lo consume>`.

Cómo elegir el alcance, ejemplos comentados y los antipatrones más frecuentes están en
[`references/ejemplos-y-alcances.md`](references/ejemplos-y-alcances.md).

## Commits atómicos

Un commit hace **una sola cosa**, porque el revert es la red de seguridad real de un
repositorio y solo funciona si el commit es separable. Si mientras arreglas un error
ves un typo en otro archivo, son dos commits. Ante trabajo mezclado, propón el recorte
tú en el paso 2 y deja que el usuario apruebe el plan.

## La rama

Antes de commitear, mira `git branch --show-current`:

- Si es `main` o `master`, **frena** y avísalo. Commitear directo a la rama principal
  salta la revisión, y en repositorios con la rama protegida el push va a fallar de
  todas formas: mejor descubrirlo antes del commit que después.
- Si el proyecto tiene una rama de integración compartida y estás en ella, pregunta
  antes de seguir.
- Si es una rama de trabajo, sigue.

Mantener la rama correcta es del desarrollador; tú solo lo señalas.

## Líneas de atribución

También lo decide el repositorio. Si el proyecto —su `CLAUDE.md`, su guía de
contribución— o el propio entorno fija trailers (`Co-Authored-By`, `Generated with`),
los añades **exactamente** como los pide. Si no hay regla, no los inventas: un trailer
es política del proyecto, no un detalle de estilo, y añadirlo donde nadie lo usa
ensucia el historial y los filtros por autor.

## Qué NO hacer

- Ejecutar `git commit` sin mostrar el mensaje y esperar el visto bueno, salvo modo
  automático pedido para la tarea.
- Meter propósitos distintos en un commit para ahorrar pasos.
- Copiar el estilo del historial viejo si el repositorio adoptó la convención después:
  mira las fechas antes de tomar el historial como referencia.
- Commitear en `main` o `master`.
- Usar `git add -A` o `git add .` cuando el plan aprobado nombraba archivos concretos:
  arrastra cambios que nadie revisó.
