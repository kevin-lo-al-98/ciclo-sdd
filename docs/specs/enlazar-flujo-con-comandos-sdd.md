# Spec: enlazar `flujo-de-requerimientos` con los comandos `/sdd-*`

Estado: **en curso**. Se abrió el 2026-10-25, a partir de una lectura de
`commands/sdd-*.md` y de `skills/flujo-de-requerimientos/` en la versión 0.2.0 del plugin.
Implementada en 0.3.0 el mismo día; falta el recorrido manual del criterio de terminado.

## Objetivo

Que `/sdd-new`, `/sdd-verify` y `/sdd-archive` apliquen las reglas que la skill
`flujo-de-requerimientos` fija para su tramo (spec → construcción → cierre) cuando un
cambio viene de una `TAREA-NNN` o de un `REQ-NNN`, sin alterar nada para quien usa los
comandos sin esa cadena. Hoy las dos mitades del ciclo de vida
([ADR 0008](../decisions/0008-el-ciclo-de-vida-es-el-eje-del-repositorio.md)) se
describen mutuamente pero no se conectan: la skill delega en los comandos y los comandos
desconocen lo que la skill les exige.

## Contexto

Cuatro huecos concretos, cada uno con su origen:

1. **El traspaso pierde criterios.** La skill dice que, al terminar la etapa spec, se
   sigue con `/sdd-new` y que no hace falta reescribir la spec
   (`skills/flujo-de-requerimientos/SKILL.md`, sección «Dónde termina esta skill»). Pero
   `/sdd-new` escribe `spec.md` desde su propio `proposal.md` (`commands/sdd-new.md`,
   paso 2) y no lee la tarea. La regla «Ningún criterio de aceptación se pierde en el
   traspaso» queda sin nadie que la aplique.
2. **Dos sitios para la misma spec.** La tabla «Cómo se trabaja cada etapa» de la skill
   remite la etapa Spec a `documentar-decisiones` (`docs/specs/`), mientras que los
   comandos la escriben en `openspec/changes/<nombre>/spec.md`. Quien siga las dos
   instrucciones al pie de la letra escribe dos specs.
3. **La verificación no rastrea hacia atrás.** `references/flujo-y-duenos.md` (§7 y
   «Trazabilidad hacia atrás») exige que la verificación llegue hasta la tarea y el PRD.
   `/sdd-verify` solo contrasta contra su `spec.md`. La skill `revisar-mr` sí mira el PRD,
   pero en el MR, cuando corregir ya cuesta un ciclo más.
4. **El archivo ignora la prueba de usuario.** Según §9 del mismo archivo, el área no
   archiva hasta que la tarea esté `Validada`, y archivar es lo que cierra la tarea.
   `/sdd-archive` solo exige `verify` en PASS y no menciona la tarea ni el registro.

Lo que no cambia: el reparto de dueños
([ADR 0011](../decisions/0011-roles-y-dueno-en-el-ciclo-sdd.md)). Los comandos siguen
sin escribir en archivos de Producto (REQ, PRD, tarea); solo los leen. El registro de
trazabilidad es la excepción que la skill ya prevé: lo escriben las dos partes, cada una
su celda (`references/registro-de-trazabilidad.md`, «Quién escribe cada celda»).

## Diseño

### Detección del origen

Un cambio **tiene origen** cuando el frontmatter de su `proposal.md` declara `tarea:` o
`requerimiento:`. Es el único dato que leen los tres comandos, así que la detección es una
sola y se hace una vez.

`/sdd-new` lo fija al arrancar:

- Si el proyecto tiene registro de trazabilidad (`requerimientos/_registro.md` o la ruta
  que declare su sección «Carpetas de este proyecto»), pregunta si el cambio viene de una
  tarea o de un requerimiento, y cuál.
- Si no lo tiene, **no pregunta nada** y el cambio no tiene origen. Por qué: la mayoría de
  los proyectos no usan la cadena (la skill misma lo desaconseja para una persona sola), y
  una pregunta que casi siempre se responde «no» se aprende a saltar.

Los campos van en el frontmatter de `proposal.md`, que es el bloque que
`references/reporte-del-area.md` admite «como bloque de su frontmatter si la spec es un
solo archivo»: `tarea` (o `requerimiento` en tamaño Ligera), `responsable` y
`areas-afectadas`. Así el reporte del área no es un archivo más.

### `commands/sdd-new.md`

Con origen, además de lo actual:

- **explore** lee la tarea, las secciones del PRD que cita (`prd-secciones`) y el REQ.
  Si la tarea no está en `Lista`, **para**: especificar sobre una tarea en `Borrador` es
  especificar sobre algo que Producto todavía puede cambiar.
- **spec** abre con una tabla **Criterios de origen**: una fila por criterio de la tarea
  (o del REQ, en tamaño Ligera), con el escenario `DADO … CUANDO … ENTONCES …` que lo
  cubre o la marca `hueco declarado` y su motivo. Ningún criterio queda sin fila. Un
  recorte de alcance no se resuelve aquí: se levanta contra el dueño del PRD.
- En el mismo cambio, completa la celda del área en el registro de trazabilidad.

### `commands/sdd-verify.md`

Con origen, añade una sección **Trazabilidad** al `verify-report.md`: por cada fila de
«Criterios de origen», el estado de su escenario en la Spec Compliance Matrix. Un criterio
de origen sin escenario ni hueco declarado es `CRÍTICO` y, por tanto, `FAIL`. Por qué
`CRÍTICO` y no advertencia: es el único fallo que la cadena existe para evitar; si solo
avisa, se archiva igual.

### `commands/sdd-archive.md`

Con origen de tipo `tarea`, antes de fundir la delta:

- Lee `validacion.estado` de la tarea. Si no es `aprobada` ni `aprobada-con-excepciones`,
  **para** y dice que falta la prueba de usuario de Producto. No es un `FAIL`: el cambio
  está bien, solo no le toca todavía.
- Al archivar, si este era el último cambio abierto de las `areas-impactadas` de la tarea,
  mueve su fila a «entregadas» en el registro de tareas. No escribe `Entregada` en la
  tarea: según su plantilla, se deriva.

Con origen de tipo `requerimiento` (tamaño Ligera), si es la última spec del REQ, pasa el
REQ a `Entregado` en su frontmatter y en el registro, que es lo que la tabla «Quién escribe
cada celda» asigna a quien archiva la última spec.

### `skills/flujo-de-requerimientos/`

- `SKILL.md`: en la tabla de etapas, la fila **Spec** remite a `/sdd-new` y, solo si el
  proyecto no usa los comandos, a `documentar-decisiones`. La sección «Dónde termina esta
  skill» dice qué hace cada comando con el origen, en tres líneas, enlazando los comandos.
- `references/flujo-y-duenos.md`: §6, §7 y §9 nombran el comando que ejecuta cada paso.

### Redacción

Los añadidos a `commands/` siguen el voseo de esos archivos; los de la skill, el tuteo de
la skill. Unificarlos es otro cambio (ver «Fuera de alcance»).

## Decisiones

Cerradas el 2026-10-25. Ninguna justifica un ADR: las dos se revierten editando un comando.

- **El origen se pregunta, no se deduce del nombre**, y solo si el proyecto tiene registro
  de trazabilidad. Deducirlo de un nombre como `tarea-012-…` obligaría a una convención de
  nombres que hoy no existe, y fallaría en silencio con cualquier nombre que no la siga.
- **Un criterio de origen sin cubrir es `CRÍTICO`.** Si el piloto
  (`docs/specs/piloto-flujo-de-requerimientos.md`) muestra que bloquea por falsos
  positivos, se baja a advertencia y el motivo se anota aquí.

## Desvíos al implementar

- **Detección del registro.** La ruta que declara «Carpetas de este proyecto» vive dentro
  del propio registro, así que no sirve para encontrarlo. `/sdd-new` busca
  `requerimientos/_registro.md` o el `_registro.md` que tenga la línea «Próximo número
  libre».
- **Plantilla del registro.** `references/registro-de-trazabilidad.md` proponía
  `docs/specs/` como carpeta de specs, que reabría el hueco 2. Ahora propone
  `openspec/changes/`, con `docs/specs/` para quien no use los comandos.
- **Cambio superado.** `/sdd-archive` no exige la prueba de usuario ni cierra nada en el
  registro cuando archiva un cambio como `Superado`: no entregó nada.
- La `description` de `commands/sdd-archive.md` menciona el nuevo motivo de bloqueo.

## Fuera de alcance

- La detección de fase de `/sdd-continue`, que ignora `tasks.md`, `apply-progress.md` y
  `verify-report.md`: es una corrección aparte, de parche.
- Unificar voseo y tuteo entre comandos y skills.
- Un validador automático del registro de trazabilidad (ya excluido por el piloto).
- La variante con firmas: `construccion` y `cierre` siguen siendo manuales.
- Cambios en `revisar-mr`, que ya revisa contra el PRD.
- Escribir en la tarea, el PRD o el REQ desde los comandos, salvo el estado `Entregado`
  del REQ en tamaño Ligera que la skill ya asigna a quien archiva.

## Pasos

1. Editar `commands/sdd-new.md`: sección «Origen» antes de «Roles» y los añadidos a explore
   y spec.
2. Editar `commands/sdd-verify.md`: sección Trazabilidad y su severidad.
3. Editar `commands/sdd-archive.md`: la puerta de la prueba de usuario y el cierre en el
   registro.
4. Editar `skills/flujo-de-requerimientos/SKILL.md` y `references/flujo-y-duenos.md`.
5. Subir `version` a `0.3.0` en `.claude-plugin/plugin.json` y añadir la entrada a
   `CHANGELOG.md`, en el mismo commit: es una pieza nueva de comportamiento, no una
   corrección.
6. Correr la verificación de `CLAUDE.md` y el recorrido manual del criterio de terminado.

## Riesgos

- **Rompe a quien usa los comandos sin la cadena.** Se nota si `/sdd-new` pregunta por el
  origen en un proyecto sin registro. Lo evita la detección por presencia del registro, y
  lo comprueba el caso 5 del criterio de terminado.
- **Los comandos crecen y dejan de leerse enteros.** `sdd-new.md` tiene 77 líneas. Si los
  añadidos lo llevan por encima de unas 110, se mueve el bloque de origen a una sección
  compartida que los tres comandos enlacen, en lugar de repetirlo.
- **La skill sigue siendo EXPERIMENTAL.** Este cambio cablea reglas que el piloto puede
  recortar. Si lo hace, se recortan también aquí, con `cerrar-plan-o-spec-con-regla-de-oro`.

## Criterio de terminado

En el repositorio:

```bash
node --test "scripts/lib/*.test.mjs"
node scripts/validar.mjs
node scripts/evaluar-disparadores.mjs
claude plugin validate .
```

Los cuatro pasan, con el único aviso esperado de `claude plugin validate`.

En un proyecto de prueba cargado con `claude --plugin-dir <ruta a ciclo-sdd>`, con un
registro, un `REQ-001`, un `PRD-001` y una `TAREA-001` en `Lista` con tres criterios:

1. `/sdd-new prueba` pregunta el origen; con `TAREA-001`, `proposal.md` lleva `tarea:
   TAREA-001` y `spec.md` tiene tres filas en «Criterios de origen».
2. Con la tarea en `Borrador`, `/sdd-new` se detiene y lo dice.
3. Si se borra una fila de «Criterios de origen», `/sdd-verify` emite `FAIL` y señala el
   criterio.
4. Con verify en PASS y `validacion.estado: pendiente`, `/sdd-archive` se detiene sin
   mover nada; con `aprobada`, archiva y mueve `TAREA-001` a «entregadas».
5. En otro proyecto **sin registro**, `/sdd-new` no pregunta el origen y los artefactos
   no llevan `tarea` ni `requerimiento`.
