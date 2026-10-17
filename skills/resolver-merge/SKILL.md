---
name: resolver-merge
description: Integrar una rama en otra y resolver los conflictos que salgan, en un merge, un rebase o un cherry-pick. Úsala cuando el usuario diga "haz el merge", "integra esta rama", "tengo conflictos", "CONFLICT (content)", "me salió un conflicto en el rebase", "resuelve estos conflictos", "¿me quedo con HEAD o con la otra?", "el merge compiló pero algo dejó de funcionar", o cuando aparezcan marcadores `<<<<<<<` en un archivo. Cubre el diagnóstico previo, el reparto entre conflicto mecánico y semántico, el protocolo de aprobación y la verificación posterior. No la uses para trabajar en varias ramas a la vez —eso es `git-worktree`—, ni para redactar el mensaje del commit resultante —eso es `escribir-mensaje-de-commit`—, ni para elegir modelo fuera de un merge —eso es `prompt-architect`.
---

# Resolver un merge

Un merge no es una operación de texto: es decidir qué intención sobrevive cuando dos
ramas cambiaron lo mismo. Git solo detecta el choque de **líneas**; el choque de
**intenciones** no lo ve nadie más que quien resuelve.

Por eso el fallo caro de esta tarea no es el conflicto que no se resuelve —ese lo
canta el compilador— sino el que se resuelve de forma plausible y borra en silencio
una funcionalidad que sí estaba. Todo lo que sigue existe para evitar ese caso.

## Los dos tipos de conflicto

| | Mecánico | Semántico |
|---|---|---|
| Ejemplos | imports, formato, lockfiles, changelog, líneas vecinas | las dos ramas cambiaron el mismo comportamiento |
| Lo marca git | sí | **no siempre** |
| Se verifica | de un vistazo | solo con tests o ejecutando |
| Riesgo | bajo | alto: sobrevive al commit |

El reparto importa porque condiciona el resto: un merge mecánico se resuelve y se
verifica en minutos; uno semántico exige entender las dos ramas antes de tocar nada.

El conflicto semántico **no lleva marcadores**. Aparece cuando una rama renombra una
función y la otra añade una llamada nueva, o cuando una cambia el valor por defecto de
un parámetro que la otra empezó a usar. Git fusiona ambos lados sin quejarse y el
resultado es incorrecto. Buscarlos es parte del trabajo, no un extra.

## Cómo trabajas

1. **Diagnóstico antes de tocar nada.** `git status --short`, la lista de archivos en
   conflicto y qué hizo cada lado desde la base común. Sin eso estás resolviendo a
   ciegas: el contenido de un bloque no dice cuál de los dos lados es el correcto.
2. **Clasifica cada conflicto** en mecánico o semántico y dilo. Es el reparto que
   decide cuánta verificación hace falta después.
3. **Por cada conflicto, una línea con la intención de cada lado** antes de proponer
   la resolución: qué quería `HEAD`, qué quería la rama entrante. Si no puedes
   escribir esa línea, todavía no entiendes el conflicto.
4. **Si las dos intenciones son incompatibles, para y pregunta.** No eliges tú. La
   respuesta no está en el código —está en qué decidió el equipo— y una elección
   silenciosa aquí es exactamente el fallo que esta skill evita. Expón qué quería cada
   lado, qué se pierde con cada opción, y espera.
5. **Resuelve, verifica y muestra el resultado.** El commit del merge se prepara
   siguiendo `escribir-mensaje-de-commit`: no se ejecuta sin visto bueno.

Los conflictos mecánicos evidentes los resuelves sin preguntar uno por uno; basta con
listarlos en el resumen final. Preguntar por cada import reordenado gasta la atención
del usuario justo donde no hace falta.

## Diagnóstico

```bash
git status --short                          # UU, AA, DU: los dos lados del choque
git diff --name-only --diff-filter=U        # solo los archivos en conflicto
git log --oneline --merge -- <archivo>      # qué commits tocaron ese archivo, por lado
git checkout --conflict=diff3 <archivo>     # rehace el bloque mostrando la base común
```

`--conflict=diff3` es el que más cambia el resultado: añade al bloque la versión
**original**, la que había antes de que las dos ramas divergieran. Sin ella ves dos
versiones y tienes que adivinar cuál cambió qué; con ella lo ves.

## Verificación

Un merge no está resuelto porque desaparezcan los marcadores.

```bash
git diff --check        # delata marcadores de conflicto olvidados
<build del proyecto>
<tests del proyecto>
```

Y además: **revisa los archivos que git fusionó sin marcar conflicto** pero que
dependen del código que sí lo tuvo. Ahí viven los conflictos semánticos. Cómo
obtener esa lista está en
[`references/casos-frecuentes.md`](references/casos-frecuentes.md), junto con los
conflictos típicos por tipo de archivo —lockfiles, migraciones, archivos generados,
renombrados— y las salidas de emergencia (`--abort`, `rerere`).

Si los tests no existen o no cubren lo que tocó el merge, dilo en el resumen. Un merge
verificado solo por que compila es un merge sin verificar, y conviene que el usuario lo
sepa antes de mergear, no después.

## Modelo y esfuerzo

Si el usuario pregunta con qué modelo abordar el merge, o el merge es lo bastante
grande como para justificar elegirlo:

| Situación | Nivel | Esfuerzo |
|---|---|---|
| Conflictos mecánicos ya inspeccionados | Haiku | `low` |
| El caso normal | Sonnet | `high` |
| Migraciones, auth, esquema de datos, facturación, ramas con semanas de divergencia | Opus | `xhigh` |

Usa la versión actual de cada nivel.

El criterio es el coste de equivocarse, no el tamaño del diff: tres líneas en una
migración pesan más que trescientas en un changelog. Y antes de bajar de modelo para
ahorrar, baja el esfuerzo — sale mejor.

Qué versión es la actual de cada nivel, los IDs exactos, los precios y el detalle del
parámetro de esfuerzo están en la skill `prompt-architect`
(`references/model-selection.md`), que es la fuente de verdad. No los dupliques aquí:
caducan.

## Qué NO hacer

- Resolver quedándote con un lado entero (`-X ours`, `-X theirs`, `git checkout
  --theirs`) sin haber leído qué hacía el otro. Es rápido y es la forma más común de
  perder trabajo.
- Commitear el merge sin build ni tests porque "solo eran imports".
- Reformatear, renombrar o limpiar código fuera del conflicto. Un merge ya es difícil
  de revisar; mezclarlo con cambios propios lo vuelve irrevisable, y el `git blame`
  posterior atribuye al merge cosas que nadie decidió ahí.
- Insistir sobre un árbol medio resuelto que se enredó. `git merge --abort` no ha
  perdido su validez mientras no haya commit: abortar y volver a empezar con mejor
  diagnóstico cuesta menos que desenredar.
