# Variante con firmas

Para cuando hay que dejar **constancia de quién validó qué**: sectores regulados,
contratos con clientes que auditan, equipos donde producto y construcción son
organizaciones distintas. Es **opt-in**. En un equipo que se fía de su propio historial de
git, estas reglas son coste sin beneficio.

> **Coste.** El proceso de origen de esta variante contaba al menos seis cambios separados
> para una sola tarea de un área, y tenía a producto como firmante o revisor
> en las nueve etapas. Antes de adoptarla, comprueba que alguien va a leer esas firmas.

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
| Validación | Quien confirma el problema | `validacion.firmada-por` |
| Viabilidad | **Una persona por área impactada** | `viabilidad.<área>` |
| PRD `Final` | Dueño del producto | Frontmatter |
| Construcción de una tarea | Quien construyó, en el área | `construccion.firmada-por` |
| Validación de una tarea | Producto, en **todo** nivel de evidencia | `validacion.firmada-por` |
| Cierre | Responsable de producto | `cierre.firmada-por` |

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

Un coste que conviene ver de entrada: las etapas de viabilidad y de seguimiento de tareas
obligan al área a editar archivos del lado de producto. Decide **antes** de adoptar si eso
es un caso normal con su propio revisor o una excepción, o la frontera dispara sobre el
trabajo ordinario.

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

Los criterios para decidir qué es «sensible» (E3) son del proyecto: escríbelos antes del
primer REQ, porque decidirlos tarea por tarea acaba en que todo es E2.

## 4. Qué validarías con un script

Todo lo de esta variante que sea comparar campos se puede automatizar: que el campo de
firma no esté vacío, que cada área impactada tenga su firma de viabilidad, que un cambio no
mezcle lados, que el cierre exija la tarea validada. Esta librería no incluye ese código
todavía. Mientras tanto, son puntos de la revisión del cambio.
