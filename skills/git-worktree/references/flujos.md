# Flujos típicos con worktrees

Cuatro situaciones frecuentes, paso a paso. Las rutas son relativas al directorio
principal del repositorio. La convención de nombres y la regla de los enlaces de
`node_modules` están en [`../SKILL.md`](../SKILL.md).

En los ejemplos la rama de integración es `main`; sustitúyela por la que use el
proyecto.

## 1. "Estoy a mitad de una feature y tengo que arreglar un error"

No hace falta `stash`: la feature se queda en su worktree tal como está.

**Pregunta antes:** ¿en qué rama está el error (`main`, una release, la rama de otro)? y
un slug corto para el arreglo. La base importa: un hotfix creado desde `main` cuando el
error está en la rama de release no se puede aplicar donde hace falta.

```bash
git worktree list            # qué ramas están ya tomadas
git fetch origin             # los refs son compartidos: basta una vez

git worktree add -b hotfix/<slug> .claude/worktrees/hotfix-<slug> main

cd .claude/worktrees/hotfix-<slug>
npm ci                       # cada worktree tiene sus propias dependencias
```

Arregla, prueba y commitea dentro de `hotfix-<slug>`. Después, integra, quita los
enlaces de `node_modules`, `git worktree remove` y `git branch -d`.

Si la base coincide con la rama que otro worktree tiene activa, no hay conflicto: la
base solo es el punto de partida. Lo que no puede repetirse es la rama que queda activa.

## 2. "Quiero revisar un PR sin tocar lo que tengo abierto"

En `--detach`, para no crear una rama local que luego haya que limpiar ni chocar si la
rama del PR ya está tomada en otro worktree.

```bash
git fetch origin
git worktree add --detach .claude/worktrees/review-<n> origin/<rama-del-PR>

cd .claude/worktrees/review-<n>
npm ci
```

Al terminar, el worktree se quita sin más: en `--detach` no queda rama que borrar.

```bash
git worktree remove .claude/worktrees/review-<n>   # tras quitar los enlaces
```

Si necesitas dejar comentarios o probar cambios encima del PR, entonces sí crea rama
(`-b`): con `--detach`, los commits que hagas no quedan referenciados por ninguna rama y
los pierde el siguiente `gc` si no apuntas el hash.

## 3. "Quiero correr los tests de otra rama mientras sigo programando"

```bash
git worktree add --detach .claude/worktrees/run-<slug> <rama>
cd .claude/worktrees/run-<slug>
npm ci
npm test
```

Dos cosas que muerden aquí:

- **El puerto.** Si el test arranca un servidor de desarrollo, dos worktrees a la vez
  chocan en el mismo puerto. Pasa `--port` distinto.
- **La instalación de dependencias.** Es lo que tarda; si vas a repetir el flujo a
  menudo, conviene dejar el worktree creado y hacer `git -C <wt> checkout` de la rama
  que toque, en lugar de crear y borrar cada vez.

## 4. "Tengo worktrees viejos y no sé cuáles borrar"

```bash
git worktree list --porcelain
```

Por cada entrada, tres comprobaciones:

```bash
git merge-base --is-ancestor <rama> main   # ¿está integrada? (código 0 = sí)
git reflog show <rama> | wc -l             # 1 sola entrada = rama sin trabajo propio
git -C <carpeta> status --porcelain        # no vacío = cambios sin commitear
```

Con eso, la recomendación:

| Situación | Qué proponer |
|---|---|
| Integrada y limpia | candidata a quitar |
| Sin integrar, o con cambios sin commitear | se queda; que decida el usuario |
| `prunable` en la salida porcelain | `git worktree prune` |
| Una sola entrada en el reflog | rama que nunca arrancó: confirma antes de borrar, no es lo mismo que terminada |

Borra de una en una, con confirmación, y nunca con `--force` en este flujo: si `remove`
se niega, es porque hay algo dentro que nadie ha revisado.
