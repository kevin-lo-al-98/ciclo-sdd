# Variante con firmas

Para cuando hay que dejar **constancia de quién validó qué**: sectores regulados,
contratos con clientes que auditan, equipos donde producto y construcción son
organizaciones distintas. Es **opt-in**. En un equipo que se fía de su propio historial de
git, estas reglas son coste sin beneficio.

> **Coste.** El proceso de origen de esta variante contaba ocho cambios en serie para una sola
> tarea de un área, y tenía a producto como firmante o revisor en las nueve etapas. Lo bajó
> moviendo lo que el área reporta a su propia spec ([`reporte-del-area.md`](reporte-del-area.md))
> y el cierre de la tarea al archivado del área; aun así, sigue siendo la variante más pesada.
> Antes de adoptarla, comprueba que alguien va a leer esas firmas.

## 1. Firma nominal

Toda firma es de **una persona con nombre propio**: no un rol ni un área.

Por qué: «firmado por Producto» no responde a quién se le pregunta tres meses después. Y un
área puede firmar sin que nadie en concreto haya leído nada.

Ningún validador puede comprobar la identidad: puede exigir que el campo no esté vacío, pero
no que la persona sea quien dice. Eso lo sostienen el archivo de propietarios del repositorio
(`CODEOWNERS` o equivalente) y la revisión del cambio. No prometas más que eso.

Se firma en estos puntos:

| Punto | Quién firma | Dónde |
|---|---|---|
| Alta del REQ | Quien lo solicita | Frontmatter y registro |
| Validación del REQ | Quien confirma el problema (titular o suplente, ver §1.1) | `validacion.firmada-por` del REQ |
| Viabilidad | **Una persona por área impactada** | `viabilidad.<área>` del REQ |
| PRD `Final` y sus enmiendas | Dueño del producto | Frontmatter y su historial |
| Construcción de una tarea | Quien construyó, en el área | `construccion.firmada-por` del **archivo de reporte** del área |
| Validación de una tarea | Producto, en **todo** nivel de evidencia, **una sola vez** | `validacion.firmada-por` de la tarea |
| Aprobación de un área afectada | Una persona de esa área | `aprobacion-areas.<área>` del archivo de reporte, o el ADR |
| Cierre de la tarea | Quien archiva el cambio, en el área | `cierre.firmada-por` del archivo de reporte |
| Cierre del REQ | Responsable de producto | Estado `Entregado` del REQ y su fecha |

El cierre de la tarea **no es de producto**: producto prueba y valida (el único acto que solo
él puede hacer), y el área, que es quien sabe si lo construido quedó archivado, lo cierra.
Reunir las dos cosas en la misma persona dejaba a producto como cuello de botella de todos
los cierres; ver [`cuellos-de-botella.md`](cuellos-de-botella.md).

### 1.1 Quién puede firmar por producto

«Producto firma» es un único punto: si la persona no está, se detienen a la vez la validación
del REQ, la de cada tarea y su cierre. Una lista **cerrada y nominal** resuelve eso sin
volver anónima la firma:

- Un archivo del proyecto (por ejemplo `requerimientos/_firmantes-de-producto.md`) nombra a
  la persona titular y a sus suplentes, con nombre propio y su usuario en la plataforma. Es el
  **único** lugar que declara quién firma por producto.
- Un suplente firma **con su propio nombre**, en el mismo campo, nunca con el del titular.
- Una firma vale si quien firma **figuraba en la lista al firmar**. Quitar a alguien no anula
  lo que ya firmó; por eso comprobarlo en el cambio que añade la firma, contra la lista de ese
  momento, y no contra la de hoy.
- La lista la mantiene producto, mediante un cambio de producto que edita ese archivo.

Se descartaron un suplente único (sigue siendo punto único) y una delegación por PRD (otro dato
que mantener por documento).

### 1.2 Cuando una herramienta firma por alguien

Si el REQ, la tarea o el archivo de reporte los escribe una herramienta en nombre de una
persona, que **el nombre salga de la identidad verificada** (la de la plataforma de código),
no de lo que la persona declare. Y que la herramienta **no escriba una firma por un área o un
rol que esa identidad no tiene**: la firma de un área la da alguien de esa área. Si no, la
firma nominal solo prueba que alguien escribió un nombre.

Esto solo importa si hay una herramienta que firma. Si las firmas las escriben las personas a
mano, la revisión del cambio sigue siendo lo que las sostiene.

## 2. Frontera entre los dos lados

La regla de la precedencia («quien pide manda en el qué, quien construye manda en el cómo»)
tiene un correlato práctico: **un mismo cambio no toca los dos lados.**

- **Lado de producto**: REQ, PRD, tareas, prototipos.
- **Lado de construcción**: ADRs, specs, el registro de decisiones.
- **Neutro**: el registro de trazabilidad, que escriben ambos lados en el mismo cambio que
  su artefacto. Ponerlo de un lado haría que la frontera disparara sobre el flujo normal,
  que es lo único que no debe hacer.

Por qué: si un cambio mezcla ambos, el revisor de un lado aprueba lo del otro por inercia, y
la firma de cada lado deja de significar que lo revisó. Se aplica con el archivo de
propietarios y, si quieres hacerlo mecánico, con un validador que falle ante un cambio con
rutas de los dos lados.

Cuando dos lados necesitan cambiar a la vez, son **dos cambios enlazados**, cada uno
apuntando al otro.

Un coste que conviene ver de entrada: la etapa de viabilidad obliga al área a editar un
archivo del lado de producto, el REQ, en su campo y sin tocar el resto. Decide **antes** de
adoptar si eso es un caso normal con su propio revisor o una excepción, o la frontera
dispara sobre el trabajo ordinario. El seguimiento de tareas era el segundo caso, y el
origen lo eliminó sacándolo de la tarea ([`reporte-del-area.md`](reporte-del-area.md)):
si tu frontera te estorba en el día a día, mira primero **qué escribe cada lado en el
archivo del otro** antes de relajarla.

Un cambio de un área que modifica lo que otra construye no lo cubre esta frontera, que solo
separa producto de construcción: para eso, las áreas afectadas
([`reporte-del-area.md`](reporte-del-area.md)).

## 3. Niveles de evidencia y doble prueba

Cada tarea declara cuánta evidencia exige. Tres niveles:

| Nivel | Tipo de tarea | Qué se exige |
|---|---|---|
| **E1** | Cambio sin comportamiento observable por el usuario (refactor, configuración) | Prueba de código. Firma de producto igualmente |
| **E2** | Comportamiento observable de cara al usuario | Prueba de código **y** prueba de usuario firmada |
| **E3** | Toca datos sensibles, autorización o una obligación normativa | Lo de E2, más la revisión de quien responde por esa materia |

**Doble prueba por tarea**: el test de código dice que la implementación hace lo que el
desarrollador entendió; la prueba de usuario dice que lo entendido es lo que se pidió. Son
preguntas distintas y ninguna sustituye a la otra.

Reglas para que no se baje de nivel en silencio:

- Proponer E1 para algo que parece comportamiento observable exige justificarlo por escrito
  en la tarea.
- Bajar de E3 a E2 también.
- El cierre (el `archive` de la spec) no puede completarse mientras la tarea asociada no
  esté `Validada`.
- En `E1` no hay prueba de usuario: la firma de producto es de presencia sobre la evidencia
  de los tests. Una segunda firma sobre lo mismo duplica la cola sin añadir juicio, y es
  trabajo técnico, justo el que producto peor sabe juzgar. Firma **una vez**.
- La firma de quien responde por la materia sensible (en el origen, el usuario experto del
  producto) es **adicional** a la de producto, en su propio campo, y nunca la sustituye. El
  origen la dejó **opcional en todos los niveles**, `E3` incluido: hacerla obligatoria sumaba
  una firma más a un flujo que ya sufría por firmas. Decide tú si en `E3` la exiges.

Los criterios para decidir qué es «sensible» (E3) son del proyecto: escríbelos antes del
primer REQ, porque decidirlos tarea por tarea acaba en que todo es E2.

## 4. Qué validarías con un script

Todo lo de esta variante que sea comparar campos se puede automatizar: que el campo de
firma no esté vacío, que cada área impactada tenga su firma de viabilidad, que un cambio no
mezcle lados, que el cierre exija la tarea validada, que el firmante figure en la lista, que
las áreas afectadas declaradas hayan firmado, que el avance derivado cuadre. Esta librería no
incluye ese código todavía. Mientras tanto, son puntos de la revisión del cambio.

Dos cosas que el origen aprendió al escribir esos validadores y que conviene decidir antes:

- **Un duro con radio global se cobra a quien no puede arreglarlo.** Un plazo vencido que
  rompe el CI de todo el repositorio castiga a todos los equipos por el incumplimiento de uno.
  Limita el bloqueo a los cambios que tocan lo vencido; para el resto, un aviso.
- **Un validador que lee un registro vacío no prueba nada.** Que la comprobación salga en verde
  con cero REQ solo significa que no hay nada que contradecir. No lo cuentes como evidencia de
  que el proceso funciona.

Y un aviso barato que no necesita el informe completo: contar los días que un REQ o una
tarea llevan en el mismo estado, a partir de las fechas que ya existen. Sin plazos, un REQ
puede quedarse meses en `Validado` sin que nada lo diga.
