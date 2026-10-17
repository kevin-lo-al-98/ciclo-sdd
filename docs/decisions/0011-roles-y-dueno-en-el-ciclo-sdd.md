---
status: accepted
date: 2026-10-16
decision-makers: Kevin Lopez Alvarez
---

# Roles y dueño en el ciclo SDD, con tres modos de trabajo

## Context and Problem Statement

Los comandos `/sdd-*` están escritos para una persona: «pausá y presentá el plan» no dice a
quién se presenta; tampoco hay nada que diga quién verifica ni quién archiva, ni de quién
es un cambio abierto en `openspec/changes/<nombre>/`. En solitario no importa. Entre dos
personas o más, un cambio sin dueño se retoma a la vez desde dos máquinas, y una
verificación hecha por quien implementó no es una segunda mirada.

`flujo-de-requerimientos` ya reparte dueños en la mitad «qué construir» («quien archiva,
cierra»). La mitad «cómo implementarlo» necesita lo mismo, sin cargar al que trabaja solo.

## Decision Drivers

* Quien trabaja solo no debe notar ningún cambio
* Un cambio tiene una sola persona responsable en cada momento, aunque se traspase
* La verificación la hace una persona distinta de quien implementó cuando hay con quién
* La configuración vive en el proyecto adoptante, no en este repositorio

## Considered Options

* Tres modos (`solo`, `pareja`, `equipo`) declarados en el `CLAUDE.md` del proyecto, y un
  `dueño` en el frontmatter de cada cambio
* Un archivo de configuración propio (`openspec/config.yaml`)
* No declarar roles y dejarlo a la convención de cada equipo

## Decision Outcome

Chosen option: "tres modos en el `CLAUDE.md` del proyecto", porque ese archivo ya se
carga en cada sesión y no hace falta inventar un formato que los comandos tengan que
buscar.

Lo que fija:

* El `CLAUDE.md` del proyecto puede llevar una sección «Ciclo de vida: roles» con el modo
  y una tabla fase → rol. La escribe `adoptar-estructura-de-docs`, con la plantilla de su
  `references/roles-del-ciclo.md`.
* **Sin esa sección, el modo es `solo`** y los comandos se comportan como hasta ahora.
* `/sdd-new` escribe `dueño` en el frontmatter de `proposal.md`.
* `/sdd-apply` y `/sdd-continue` avisan si quien ejecuta no es el dueño y, si se confirma
  el traspaso, lo registran en `apply-progress.md`. No bloquean: un traspaso es legítimo.
* En `pareja` y `equipo`, `/sdd-verify` registra quién verifica, y si es el mismo que
  implementó el veredicto no puede pasar de PASS WITH WARNINGS.
* `/sdd-archive` lo ejecuta el dueño tras un PASS.

### Consequences

* Good, because el modo `solo` es el valor por defecto y no exige configurar nada
* Good, because el dueño queda escrito en el propio cambio, donde lo ve quien lo retome
* Bad, because la identidad de quien ejecuta un comando es la que da el usuario o
  `git config user.name`: es una convención, no un control de acceso
* Bad, because los comandos dependen de una sección del `CLAUDE.md` que alguien puede
  borrar o dejar desactualizada

## Pros and Cons of the Options

### Archivo de configuración propio

* Good, because se podría validar con un esquema
* Bad, because es un formato más que mantener, y los comandos tendrían que buscarlo en
  cada fase

### No declarar roles

* Good, because no hay nada que mantener
* Bad, because deja sin resolver justo lo que falla entre dos personas
