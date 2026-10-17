# Operaciones — flujos detallados

Cada operación corre el mismo esqueleto: **leer el estado actual → proponer ediciones →
confirmar con el usuario → escribir el archivo**. Nunca escribas `ROADMAP.md` sin mostrar
antes el diff.

Las reglas de validación al final de este archivo TIENEN que cumplirse después de cada
escritura, sin importar qué operación la disparó.

---

## Inicializar

Usala cuando `ROADMAP.md` no existe todavía en la raíz del proyecto.

1. **Recorré `openspec/changes/`**. Tratá cada subdirectorio directo que *no* sea
   `archive/` como un cambio activo.
   - Para cada cambio activo, leé `proposal.md` (si existe) para extraer un estado de una
     línea. Si no se puede leer, usá `"activo"` como valor por defecto.
2. **Preguntale al usuario** por:
   - Cualquier tarea Pendiente que quiera sembrar (con ruta de PRD si tiene, dependencias
     con entradas En curso, y el Próximo paso explícito).
   - Cualquier idea Futura (descripción libre, nombre SDD sugerido opcional).
3. **Escribí el archivo** con las tres secciones pobladas, en el orden En curso → Pendiente
   → Futuro. Las entradas Pendientes numeradas empiezan en `1.`.
4. **Validá** antes de declarar terminado (ver *Validación* más abajo).

Si `openspec/changes/` contiene muchos cambios activos (digamos, más de 5), pausá antes de
poblar En curso — esa cantidad de cambios simultáneos suele ser señal de cambios estancados
que conviene archivar primero. Mostrá el número y preguntá.

---

## Agregar tarea

Se dispara cuando el usuario dice "agregá esto al roadmap" o nombra una tarea concreta para
registrar.

1. **Preguntá en qué sección.** Por defecto, **Pendiente** si el usuario no lo aclara.
   **Futuro** es solo para ideas sin un próximo paso concreto. **En curso** normalmente se
   llena vía *Promover*, no vía *Agregar* — permití la inserción directa acá solo si el
   usuario está registrando un cambio SDD que arrancó fuera del flujo del roadmap.
2. **Capturá el mínimo esquema** de esa sección (ver la lista de campos en `SKILL.md`).
   Negate a escribir campos extra que no estén en el esquema — esos pertenecen al SDD/PRD
   enlazado.
3. **Para entradas Pendientes**, resolvé las dependencias. Preguntá qué cambios En curso
   bloquean esta tarea. Si una dependencia declarada no está En curso, señalá el desajuste
   — o la dependencia está mal, o hay que agregarla primero a En curso.
4. **Determiná la posición**:
   - **En curso** — se agrega al final (el orden no es significativo en esta sección).
   - **Pendiente** — se inserta en orden de dependencia. Después de que se resuelvan todas
     las tareas bloqueadas, la tarea arrancable *menos restringida* debería quedar en la
     posición 1. Renumerá la lista.
   - **Futuro** — se agrega al final.
5. **Escribí**, y volvé a validar el invariante de arrancabilidad.

---

## Promover

La promoción siempre es **hacia arriba**: Futuro → Pendiente, o Pendiente → En curso. La
degradación (Pendiente → Futuro) está permitida si el alcance se difirió, pero señalala
como algo inusual y confirmá antes de escribir.

### Futuro → Pendiente

- **Confirmá que la tarea tiene un próximo paso concreto.** Si no, el usuario está
  promoviendo demasiado pronto — objetá y mantenela en Futuro.
- **Si el usuario quiere un PRD**, delegá en `flujo-de-requerimientos` **antes** de editar
  el roadmap. Movela solo una vez que el archivo de PRD exista, o si el usuario elige
  explícitamente saltarse el PRD.
- **Agregá los campos de Pendiente** — Tipo, ruta de PRD (si hay), Depende de, Próximo
  paso, Notas — e insertala en orden de dependencia. Renumerá.

### Pendiente → En curso

- **El camino estándar es delegar en `/sdd-new <nombre-del-cambio>`**. El flujo SDD es
  dueño de los artefactos proposal/spec/design/tasks; la entrada del roadmap se mueve solo
  una vez que la carpeta del cambio SDD existe.
- **Después de que `/sdd-new` termine exitosamente**:
  - Quitá la entrada de Pendiente. Renumerá las que queden.
  - Insertala en En curso con `Estado: spec redactada` (o lo que indique el resultado de
    esa fase SDD).
  - Volvé a resolver el campo `Bloquea:` de la nueva entrada En curso: cualquier tarea
    Pendiente cuyo `Depende de:` mencione este nombre de cambio ahora tiene una referencia
    real.
- **Para tareas no-SDD** que el usuario arranca inline, simplemente borrá la entrada
  Pendiente — el trabajo no-SDD no tiene representación En curso (no hay carpeta de cambio
  SDD a la que enlazar, y nada depende de ella a través del roadmap).

---

## Reorganizar

Se dispara cuando el usuario cambia prioridades, una entrada En curso nueva agrega
bloqueos nuevos, o cambió el `Depende de:` de una entrada Pendiente.

1. **Construí el grafo de dependencias** a partir de En curso + Pendiente. Cada nodo
   Pendiente apunta a los nodos En curso de los que depende. Los bordes Pendiente →
   Pendiente no están permitidos (ver antipatrones en `SKILL.md`).
2. **Detectá ciclos.** Solo pueden aparecer si el usuario está expresando dependencias
   Pendiente → Pendiente de forma ilegal. Objetá: la forma correcta es mantenerlas en
   secuencia en la lista Pendiente y confiar en el orden, no en `Depende de:`.
3. **Ordená Pendiente** para que la posición 1 sea la entrada con menos bloqueos sin
   resolver (idealmente cero). Ordená de forma estable según la prioridad que dio el
   usuario (el orden en que listó las dependencias originalmente) para desempatar.
4. **Señalá el desabastecimiento.** Si cada entrada Pendiente depende de al menos un
   cambio En curso, avisá que el roadmap está desabastecido y preguntá si conviene
   promover una entrada Futura que sea independiente.
5. **Renumerá** la lista Pendiente y escribí.

---

## Limpiar

Se dispara después de que corre `/sdd-archive`, o cuando el usuario nota entradas
desactualizadas.

1. **Buscá los cambios archivados**: recorré `openspec/changes/archive/`.
2. **Para cada cambio archivado**, si existe una entrada En curso que coincide, quitala.
3. **Para cada entrada Pendiente cuyo `Depende de:` referenciaba el cambio que acabás de
   quitar**, eliminá esa dependencia. Volvé a chequear el invariante de arrancabilidad — la
   entrada puede estar lista para promover ahora.
4. **Mostrá** el diff (entradas quitadas, dependencias limpiadas) antes de escribir.

Limpiar nunca *crea* nada; solo quita y desbloquea. Si el usuario también quiere promover
una entrada Pendiente recién desbloqueada a En curso, eso es un paso de *Promover* aparte.

---

## Auditar / refrescar

Se usa cuando se cree que el roadmap y `openspec/changes/` se desincronizaron, o después de
un período largo sin mantenimiento del roadmap.

1. **Construí dos conjuntos**: los cambios activos de `openspec/changes/`, y las entradas
   En curso de `ROADMAP.md`.
2. **Reportá**:
   - **En `openspec/changes/` pero no en En curso** → proponé agregarlo a En curso.
   - **En En curso pero archivado** en `openspec/changes/archive/` → proponé quitarlo.
   - **En En curso pero ya no existe en ningún lado** → proponé quitarlo con una advertencia
     más fuerte (el cambio se borró, no se archivó — puede haber trabajo sin terminar).
   - **Entradas Pendientes cuyo `Depende de:` apunta a un cambio que ya no existe** →
     proponé eliminar la dependencia o la entrada.
3. **Nunca corrijas automáticamente.** Pedile al usuario que confirme cada edición
   propuesta una por una. Los roadmaps arquitectónicos sobreviven a implementaciones
   específicas y el usuario puede querer conservar entradas que la auditoría cree
   desactualizadas.

---

## Validación — tiene que cumplirse después de cada escritura

Corré **todas** estas antes de declarar terminada una operación. Si alguna falla, no
escribas el archivo; señalá la falla y preguntale al usuario.

1. **Invariante de arrancabilidad**: la primera entrada Pendiente tiene `Depende de:` vacío
   o igual a `—`.
2. **Las referencias de En curso resuelven**: toda ruta `SDD:` en En curso apunta a una
   carpeta real bajo `openspec/changes/`.
3. **Las dependencias de Pendiente resuelven**: toda referencia `Depende de:` en Pendiente
   coincide con el nombre de cambio de una entrada En curso existente.
4. **Sin bordes Pendiente → Pendiente**: las dependencias en Pendiente solo apuntan a En
   curso (o están vacías). La secuencia entre entradas Pendientes se expresa con el orden,
   nunca con `Depende de:`.
5. **Las entradas Futuro no llevan dependencias**: Futuro es pre-formal. Si el usuario
   quiere expresar una dependencia, la entrada pertenece a Pendiente, no a Futuro.
6. **Sin nombres de cambio duplicados** entre secciones. Un cambio está En curso, o
   Pendiente, o Futuro — nunca dos de esas a la vez.
7. **La lista Pendiente renumerada** es contigua (1, 2, 3, …) y coincide con la cantidad de
   entradas Pendientes.

Una falla de validación es señal de que el modelo mental del usuario y el esquema se
desincronizaron. Señalá la regla específica que falló y proponé la edición más chica que la
restaura — no le pidas al usuario que encuentre el arreglo solo.
