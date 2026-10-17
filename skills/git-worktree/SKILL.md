---
name: git-worktree
description: Trabajar en varias ramas a la vez con `git worktree` — crear, listar, sincronizar, bloquear, mover y eliminar worktrees— en lugar de `git stash`, cambiar de rama o clonar otra vez; y aplastar (squash) todos los commits de la rama actual en uno solo antes de integrar. Úsala cuando el usuario diga "worktree", "necesito dos ramas a la vez", "un hotfix sin perder lo que tengo a medias", "revisar un PR sin cambiar de rama", "correr los tests de otra rama mientras sigo", "no quiero hacer stash", "tengo worktrees viejos, ¿cuáles borro?", "aplasta la rama en un commit", "squash de esta rama", "consolidá estos commits en uno solo antes del force-push". Incluye la trampa de los enlaces dentro de `node_modules`, que hace que `git worktree remove` borre archivos fuera del worktree. No la uses para un merge o un rebase normal dentro de un solo directorio de trabajo.
---

# Worktrees de git

Un worktree es otro directorio de trabajo del **mismo** repositorio. Comparte
historial, objetos, refs, stash, hooks y `.git/config`, pero tiene su propia rama
activa, su propio índice y sus propios archivos ignorados. Git no permite la misma rama
en dos worktrees a la vez.

Sustituye a `git stash` y al cambio de rama: cada cosa en curso se queda en su carpeta,
tal como estaba, sin tocar el árbol de trabajo de las demás.

## Convención

| Caso | Rama | Carpeta | Base |
|---|---|---|---|
| Feature | la del proyecto (`feature/<slug>`…) | `.claude/worktrees/<slug>` | rama de integración |
| Hotfix | `hotfix/<slug>` | `.claude/worktrees/hotfix-<slug>` | la rama donde está el error — **pregunta** |
| Revisar un PR | ninguna (`--detach`) | `.claude/worktrees/review-<n>` | `origin/<rama-del-PR>` |
| Probar otra rama | ninguna (`--detach`) | `.claude/worktrees/run-<slug>` | la rama a probar |

- El `<slug>` es kebab-case, sin acentos, y **el mismo en la rama y en la carpeta**:
  así se deduce una de la otra sin consultar `git worktree list`.
- La base por defecto es la rama de integración del proyecto (`main`, `develop`, o la
  que use). Si no está claro cuál es, pregunta: crear la rama desde la base equivocada
  se descubre en el merge, cuando ya hay commits encima.
- Revisar y probar van en `--detach`, para no dejar ramas locales sueltas ni chocar con
  "rama ya en uso" cuando alguien más la tenga tomada.
- Añade `.claude/worktrees/` al `.gitignore` del proyecto. Es además la ruta que usa
  `EnterWorktree` de Claude Code, así que las dos vías conviven.

## Cómo trabajas

1. **Diagnóstico primero:** `git worktree list` y `git status --short`. Así sabes qué
   ramas están tomadas y si hay algo sin commitear que se pueda perder.
2. **Si falta un dato, pregunta antes de ejecutar:** la base de un hotfix, el slug
   cuando la petición no lo sugiere, la rama o el número del PR.
3. Los comandos que solo leen (`list`, `status`, `fetch`) los ejecutas directo. Los que
   crean, mueven o borran, los anuncias antes.
4. Todo lo que puede perder trabajo —`--force`, `branch -D`, `prune` sobre una carpeta
   que sí existe— se avisa y no se ejecuta sin un sí explícito.

Los cuatro flujos habituales, paso a paso, están en
[`references/flujos.md`](references/flujos.md).

## Operaciones

```bash
# Rama que ya existe en local
git worktree add .claude/worktrees/<slug> <rama>

# Rama nueva a partir de la integración
git worktree add -b feature/<slug> .claude/worktrees/<slug> main

# Rama que solo existe en el remoto
git fetch origin
git worktree add -b feature/<slug> .claude/worktrees/<slug> origin/feature/<slug>

# Listar y diagnosticar (porcelain muestra locked y prunable)
git worktree list
git worktree list --porcelain

# Bloquear uno de larga duración o en disco extraíble (prune no lo toca)
git worktree lock --reason "<motivo>" .claude/worktrees/<slug>
git worktree unlock .claude/worktrees/<slug>
```

Sincronizar con la integración se hace dentro del worktree, como en cualquier rama:
`git -C .claude/worktrees/<slug> rebase main`. No hace falta un `fetch` por worktree,
porque los refs son compartidos.

## Antes de `remove` o `move`: los enlaces dentro de `node_modules`

Un workspace de npm, pnpm o yarn crea dentro de `node_modules` **enlaces** a los
paquetes locales: junctions en Windows, symlinks en Unix. `git worktree remove` borra el
directorio de forma recursiva y en Windows **recorre esas junctions**, así que borra
también lo que hay al otro lado. Es un caso real, no una hipótesis: un `remove` de un
worktree vació el directorio fuente de la librería compartida del repositorio
principal, que no era parte del worktree.

Antes de `remove` o `move`, quita los enlaces:

```bash
# Localizarlos (Unix, y Git Bash con enlaces creados como symlink)
find .claude/worktrees/<slug>/node_modules -maxdepth 3 -type l

# Borrar solo el enlace, nunca su destino
rm .claude/worktrees/<slug>/node_modules/<paquete-local>
```

```powershell
# Windows: junctions. Delete con $false NO recorre el enlace
Get-ChildItem ".claude\worktrees\<slug>\node_modules" -Recurse -Depth 2 -Force |
  Where-Object LinkType | ForEach-Object {
    [System.IO.Directory]::Delete($_.FullName, $false)
  }
```

Y solo entonces:

```bash
git worktree remove .claude/worktrees/<slug>
git status --short          # confirma que el repositorio principal quedó intacto
```

Para **mover**: quita los enlaces, `git worktree move <vieja> <nueva>`, y reinstala las
dependencias en la ruta nueva para recrearlos. `move` no los reescribe: quedan
apuntando a la ruta antigua, que ya no existe.

### `--force` y `prune`

- `git worktree remove` se niega si hay cambios sin commitear o archivos sin trackear.
  **Esa negativa es la protección, no un obstáculo.** `--force` descarta ese trabajo
  para siempre; antes de proponerlo, muestra `git -C <wt> status --short` y pregunta si
  hay algo que salvar. Un worktree bloqueado exige `--force` dos veces: si el bloqueo ya
  no tiene sentido, lo correcto es `unlock`.
- **Nunca** `rm -rf` ni `Remove-Item -Recurse` sobre un worktree: aparte del problema de
  los enlaces, deja metadatos huérfanos en `.git/worktrees/`.
- Si la carpeta ya se borró a mano, `git worktree prune --dry-run` muestra qué limpiaría
  y `git worktree prune` lo hace. Solo afecta a entradas cuya carpeta no existe.

## Qué no se comparte

| Cada worktree lo necesita aparte | Es compartido |
|---|---|
| `node_modules` → instalar en cada uno; **no** enlazarlo entre worktrees | Historial, objetos, ramas, tags, remotos |
| Cachés de build y salidas (`dist/`, `coverage/`, cachés del framework) | `git stash` (es global al repositorio) |
| `.env*` y configuración local no versionada (copiar a mano) | Hooks y `.git/config` |
| El puerto del servidor de desarrollo: dos a la vez piden `--port` distinto | |

Enlazar `node_modules` entre worktrees parece un ahorro y es la causa del problema de la
sección anterior, además de mezclar versiones cuando dos ramas tienen dependencias
distintas.

## Cerrar una rama

1. Build, tests y lint limpios dentro del worktree.
2. Integrar: PR, o merge local desde el directorio principal si el proyecto trabaja así.
3. Quitar los enlaces y `git worktree remove`.
4. `git branch -d <rama>`. Si git responde "not fully merged", **para y avisa**: no
   pases a `-D` sin un sí explícito, porque eso descarta commits que no están en
   ninguna otra rama.
5. `git worktree prune` por si quedó metadata suelta.

## Aplastar una rama en un commit

Antes de integrar, a veces conviene consolidar todos los commits de la rama actual en uno
solo, con un mensaje bien armado. No es una operación de worktree en sí, pero suele pasar
justo antes de cerrar una rama que vivía en uno.

1. Identificá la rama actual (`git branch --show-current`). **Negate a aplastar una rama
   protegida** (`main`, `master`, `stable`): si es una de esas, parate con un error en vez
   de seguir.
2. Si hay cambios sin commitear (`git status --porcelain`), guardalos con
   `git stash push -m "squash-branch: auto-stash before reset"` antes de tocar nada, salvo
   que el usuario pida explícitamente lo contrario.
3. Determiná la rama base probando en orden `main`, `master`, `stable` con
   `git merge-base HEAD <candidata>`; si ninguna es ancestro de `HEAD`, usá
   `git remote show origin | grep 'HEAD branch'`. Si no se puede determinar, parate y
   pedile al usuario que la indique a mano.
4. El diff completo entre la base y `HEAD` (`git diff <merge-base>..HEAD`) es la **fuente de
   verdad** del mensaje: refleja el cambio neto real. Si es muy grande, mirá primero
   `git diff --stat` y entrá a archivos individuales solo si hace falta.
5. El log de commits de la rama (`git log <merge-base>..HEAD --oneline`) es **contexto
   complementario** — puede explicar el *por qué*, pero descartá cualquier cosa sobre
   cambios que después se revirtieron o se superaron: el diff manda.
6. Para el idioma y el formato del mensaje, mirá el historial reciente de la rama base
   (`git log <base> --oneline -20`) y seguí la misma convención. Si no hay una consistente,
   usá la convención de commits de la skill `escribir-mensaje-de-commit`.
7. **Pedile confirmación al usuario** antes de tocar nada: mostrale el hash del
   merge-base, cuántos commits se van a aplastar, y el mensaje propuesto.
8. Con la confirmación, hacé `git reset --soft <merge-base>` y commiteá con el mensaje
   aprobado (`-m` separado para asunto y cuerpo, para preservar el formato multilínea).
9. Si guardaste un stash en el paso 2, recuperalo (`git stash pop`). Si hay conflictos,
   avisá que el stash quedó en `git stash list` para resolverlo a mano.
10. Indicale al usuario el comando para el force-push (`git push --force-with-lease`).
    **Nunca lo ejecutes vos** salvo que el usuario te dé permiso explícito para hacerlo.

## Diagnosticar worktrees viejos

Por cada entrada de `git worktree list --porcelain`, una fila:

| Carpeta | Rama | ¿Mergeada? | ¿Cambios sin commitear? | Estado |
|---|---|---|---|---|

- Mergeada: `git merge-base --is-ancestor <rama> main`. **Cuidado:** una rama recién
  creada, sin commits propios, también da "mergeada". Si `git reflog show <rama>` tiene
  una sola entrada, es trabajo que no arrancó, no trabajo terminado.
- Sin commitear: `git -C <wt> status --porcelain` no vacío.
- Estado: `locked` o `prunable`, de la salida porcelain.

**Recomienda, no borres.** Mergeada y limpia es candidata; sucia o sin mergear se queda
salvo que el usuario decida otra cosa. Una por una, con confirmación.
