# Alcances, ejemplos y antipatrones

Material de consulta de la skill `escribir-mensaje-de-commit`. El `SKILL.md` tiene las
reglas; aquí están los casos.

## Cómo elegir el alcance

El alcance ubica el cambio en una palabra. No lo inventes: un alcance nuevo por commit
fragmenta el historial y deja inservible cualquier filtro por área.

Mira primero los que el repositorio ya usa:

```bash
git log --format='%s' -300 | sed -n 's/^[a-z]*(\([^)]*\)).*/\1/p' | sort | uniq -c | sort -rn
```

Si no sale nada, el repositorio no usa alcances todavía. Derívalos de su estructura
real —los directorios de primer nivel de `src/`, los paquetes de un monorepo, los
proyectos de un workspace— y propón el que corresponda al cambio.

Si el cambio es transversal y no hay un alcance claro, **omítelo**. Un alcance falso
informa peor que ninguno.

## Ejemplos

Cambio simple, sin cuerpo. El título se explica solo:

```
fix(auth): corregir la expiración del token en el refresh
```

Con cuerpo, porque la razón no se ve en el diff:

```
refactor(pedidos): mover el cálculo de totales a un módulo puro

El cálculo vivía en el componente y no había forma de probarlo sin montar la
vista entera. Al extraerlo se puede cubrir con tests unitarios y se reutiliza
en el resumen del carrito, que hasta ahora duplicaba la fórmula.

Refs #482
```

Breaking change. Va el `!` en el título **y** el bloque al pie, porque las herramientas
que generan changelogs leen uno u otro según su configuración:

```
feat(api)!: unificar el modelo de Cliente

BREAKING CHANGE: el campo 'nombre' se divide en 'nombres' y 'apellidos'. Los
consumidores del endpoint /clientes deben actualizar sus proyecciones antes de
subir a la versión 3.
```

Solo documentación:

```
docs: documentar el flujo de despliegue en el README
```

## Un plan de varios commits

Así se presenta el recorte en el paso 3 del protocolo, antes de ejecutar nada:

```
Propongo 2 commits:

1) fix(tabla): corregir el orden de las columnas al filtrar
   git add src/tabla/tabla.component.ts src/tabla/tabla.component.spec.ts

   El comparador usaba el índice visual en lugar del de la columna, así que
   al filtrar se ordenaba por la columna equivocada.

2) chore(tooling): subir eslint a 9.14

   git add package.json package-lock.json

   Cambio de versión que quedó pendiente; va aparte del fix para poder
   revertirlo solo si rompe el pipeline.
```

## Antipatrones

| Mensaje | Qué está mal |
|---|---|
| `Añade las specs de screening` | tiempo verbal incorrecto y sin tipo |
| `fix: cosas varias` | no es atómico y la descripción no dice nada |
| `feat(tabla): agregar filtros.` | punto final |
| `fix: arreglar el bug` | ¿cuál? El título tiene que identificar el cambio |
| `feat: WIP` | un commit de trabajo a medias no describe un propósito |
| `refactor(todo): limpiar` | alcance inventado y sin contenido |
| `fix(login): cambiar la línea 42 de auth.service.ts` | describe el cómo, que ya está en el diff |

El último es el error más frecuente cuando el mensaje lo redacta un modelo: resume el
diff en lugar de explicarlo. Si el cuerpo se puede deducir leyendo el propio diff, no
aporta y es mejor omitirlo.
