# Sección «Ciclo de vida: roles» del `CLAUDE.md`

Los comandos `/sdd-*` leen esta sección para saber quién aprueba, quién verifica y quién
archiva un cambio ([ADR 0011](../../../docs/decisions/0011-roles-y-dueno-en-el-ciclo-sdd.md)
de ciclo-sdd). **Si la sección no existe, el modo es `solo`** y los comandos funcionan
como siempre. Escríbela solo cuando trabajan dos personas o más.

## Elegir el modo

| Modo | Cuándo | Qué cambia en los comandos |
|---|---|---|
| `solo` | Una persona pide, construye y verifica | Nada. Es el valor por defecto |
| `pareja` | Dos personas construyen | Cada cambio tiene `dueño`; la otra persona verifica |
| `equipo` | Tres o más personas, o roles separados (producto, áreas que construyen) | Lo mismo que `pareja`, con los roles de la tabla; suele ir con `flujo-de-requerimientos` |

## Plantilla

Añádela al final del `CLAUDE.md` del proyecto y rellena los nombres. Un rol puede ser una
persona o una lista cerrada de personas; nunca «el equipo», porque un rol de todos acaba
siendo de nadie.

```markdown
## Ciclo de vida: roles

Modo: `pareja`   <!-- solo | pareja | equipo -->

| Fase | Quién | Regla |
|---|---|---|
| Aprobar el plan (`/sdd-new`, paso 5) | <persona o personas> | Quien no es el dueño del cambio |
| Implementar (`/sdd-apply`) | El `dueño` del cambio | Un traspaso se registra en `apply-progress.md` |
| Verificar (`/sdd-verify`) | <persona o personas> | Nunca quien implementó |
| Archivar (`/sdd-archive`) | El `dueño` del cambio | Solo tras PASS o PASS WITH WARNINGS |

La identidad de quien ejecuta un comando es su `git config user.name`.
```

## Por qué cada regla

- **Un dueño por cambio.** Sin dueño, dos personas retoman el mismo cambio con
  `/sdd-continue` en dos máquinas, y el segundo merge se come el trabajo del primero.
- **El plan lo aprueba otra persona.** Es el punto más barato para frenar un alcance
  equivocado: todavía no hay código.
- **Verifica quien no implementó.** Quien escribió el código comparte sus puntos ciegos;
  una matriz de cumplimiento llenada por la misma persona confirma lo que ya creía.
- **Archiva el dueño.** Archivar funde la delta en `openspec/specs/`, que es la verdad
  consolidada; lo hace quien mejor conoce lo que cambió, igual que en
  `flujo-de-requerimientos` («quien archiva, cierra»).

Esto es una convención, no un control de acceso: los comandos avisan y registran, no
bloquean. Si hace falta bloquear, el sitio es la protección de ramas del repositorio
(revisores obligatorios), no el comando.
