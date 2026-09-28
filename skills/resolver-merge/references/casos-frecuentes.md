# Casos frecuentes al resolver un merge

## Encontrar los conflictos semánticos

Los archivos que **los dos lados tocaron** son la zona de riesgo. Los que git marcó
con `UU` ya los estás mirando; los peligrosos son los otros: los que ambos lados
modificaron en líneas distintas y git fusionó sin decir nada.

```bash
BASE=$(git merge-base HEAD MERGE_HEAD)
comm -12 \
  <(git diff --name-only "$BASE" HEAD | sort) \
  <(git diff --name-only "$BASE" MERGE_HEAD | sort)
```

Durante un rebase o un cherry-pick la otra punta no es `MERGE_HEAD` sino
`REBASE_HEAD` o `CHERRY_PICK_HEAD`.

Esa lista, menos los archivos en conflicto, es lo que hay que revisar a mano. No es
una lista de errores: es dónde mirar. Suele ser corta, y ese repaso es la diferencia
entre un merge que compila y uno que funciona.

Busca además las llamadas a lo que cambió de firma:

```bash
git grep -n "<nombre de la función o símbolo>"
```

## Conflictos por tipo de archivo

### Lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`)

**No se resuelven a mano: se regeneran.** Son artefactos derivados del manifiesto, y
un lockfile editado a mano puede quedar internamente inconsistente sin que nada lo
detecte hasta la instalación en CI.

```bash
git checkout --theirs package-lock.json   # cualquier lado sirve de punto de partida
# resuelve primero el conflicto de package.json, y entonces:
npm install                               # regenera el lock coherente con el manifiesto
git add package.json package-lock.json
```

El conflicto real está en `package.json`: dos ramas que subieron la misma dependencia
a versiones distintas. Esa decisión —qué versión queda— sí es del usuario si las
mayores no coinciden.

### Migraciones de base de datos

Dos ramas que añaden una migración generan **dos migraciones nuevas**, no un
conflicto de contenido. El problema es el orden: si ambas asumen el mismo estado
previo del esquema, la segunda en aplicarse falla, o peor, aplica sobre un esquema que
no es el que esperaba.

Nunca fusiones dos migraciones en una ni reordenes timestamps por tu cuenta: pregunta.
Y si el proyecto tiene un archivo de esquema consolidado (`schema.rb`, `schema.prisma`
generado), ese se regenera, no se mergea.

### Archivos generados

Builds, `dist/`, snapshots de tests, clientes de API generados, traducciones
compiladas: se regeneran ejecutando el generador después de resolver las fuentes.
Resolverlos a mano produce un archivo que no corresponde a ninguna entrada.

Si aparecen en el conflicto de forma recurrente, señálalo: probablemente no deberían
estar versionados.

### Renombrado contra edición

Una rama renombra o mueve un archivo, la otra lo edita. Git lo detecta por
similitud, pero si el renombrado vino acompañado de cambios grandes, falla y
presenta el archivo como borrado en un lado y modificado en el otro (`DU`, `UD`).

```bash
git log --follow --oneline -- <ruta antigua>   # confirma que hubo renombrado
git show MERGE_HEAD:<ruta nueva>               # ve el contenido del otro lado
```

La resolución casi siempre es: conservar la ruta nueva y aplicarle la edición del otro
lado a mano. Quedarse con "borrado" descarta la edición sin avisar.

## Salidas y atajos

### Abortar

```bash
git merge --abort          # mientras no haya commit del merge
git rebase --abort
git cherry-pick --abort
```

`--abort` devuelve el árbol al estado previo. `--quit` **no**: deja los cambios ya
resueltos en el árbol y solo olvida la operación, así que se parece a terminar pero no
lo es. Usa `--abort` salvo que sepas exactamente por qué quieres lo otro.

Si el merge ya está commiteado y no se compartió, `git reset --hard ORIG_HEAD` lo
deshace. Anúncialo antes de ejecutarlo: descarta cualquier cosa sin commitear que haya
en el árbol.

### `rerere`

```bash
git config rerere.enabled true
```

Git recuerda cómo resolviste un conflicto y lo reaplica si vuelve a aparecer el mismo.
Vale la pena en rebases largos o en ramas que se sincronizan con la integración una y
otra vez, porque ahí el mismo conflicto reaparece en cada intento.

Con la contrapartida de que reaplica en silencio: si la resolución grabada era mala,
la propaga. Revisa igual el resultado.

### Herramienta de merge

```bash
git mergetool
```

Útil para el usuario, no para ti: abre una interfaz interactiva. Propónsela cuando el
conflicto sea grande y visual —dos versiones muy divergentes del mismo archivo— en
lugar de resolver a ciegas sobre el texto con marcadores.

### Estrategias por bloque

`-X ours` y `-X theirs` resuelven **automáticamente todos** los conflictos a favor de
un lado. No son un atajo de resolución: son la renuncia a resolver. Legítimos en casos
concretos —regenerar un archivo derivado, descartar una rama de la que solo quieres el
historial— y nunca como forma de terminar antes.

Ojo con el significado de `ours` y `theirs`: **se invierte en un rebase**. Durante un
rebase, `ours` es la rama sobre la que estás rebasando (la base) y `theirs` son tus
propios commits. Confundirlo descarta justo lo contrario de lo que pretendías.
