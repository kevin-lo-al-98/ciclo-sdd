# Qué hacer cuando el pedido cambia a mitad de camino

Pasa siempre. Lo que cambia es el coste, que depende de **dónde** esté el cambio. La regla
común: lo que ya se firmó o se especificó contra un documento no se reescribe en silencio;
se versiona, para que se pueda rastrear qué se construyó contra qué versión.

| El cambio afecta | Qué se hace | Por qué |
|---|---|---|
| **El problema mismo** | Un REQ nuevo. El anterior se cierra como `Descartado` o se acota, con el motivo escrito | Si el problema cambió, lo especificado hasta ahora responde a otro; mezclarlo en el mismo REQ borra esa frontera |
| **El comportamiento, con el PRD ya `Final`** | Una **enmienda**, acotada o mayor (ver abajo), y revisión de las tareas y specs de lo que toca | Las specs ya escritas apuntan a una versión; editarla debajo de ellas las deja contradiciéndose sin que nadie lo vea |
| **Un detalle que la spec resolvió por su cuenta** | Se corrige en la spec; si la decisión era de producto, se sube al PRD | Una decisión de comportamiento tomada en una spec es invisible para las otras áreas |
| **Una decisión técnica ya tomada** | ADR nuevo, el anterior `superseded`. El cuerpo de un ADR aceptado no se edita | La historia de por qué se decidió algo no debe cambiar porque hoy se decida lo contrario |
| **Un REQ ya `Aceptado` (alcance o criterios)** | Se anota en la sección «Historial» del REQ con fecha y quién; si cambia el problema o los criterios, **todas** las áreas confirman de nuevo; si solo se añaden áreas, confirman las añadidas | Lo que las áreas aceptaron fue el enunciado anterior. La regla completa, en la etapa 3 de [`flujo-y-duenos.md`](flujo-y-duenos.md) |
| **Un hotfix en producción** | Una tarea de vía rápida y, dentro del plazo, un REQ nuevo que la regulariza y cita un REQ de referencia | Un hotfix es un requerimiento más; lo que lo distingue es que tiene prioridad y que se documenta después. Ver [`plantilla-tarea.md`](plantilla-tarea.md) |

## Cómo decidir cuál de las filas es

Pregunta en este orden y detente en la primera que sea afirmativa:

1. ¿Cambió **qué problema hay** o **para quién**? → REQ nuevo.
2. ¿Cambió **cómo se comporta** el producto? → enmienda del PRD.
3. ¿Cambió **cómo se construye** sin cambiar el comportamiento? → ADR o spec, según el caso.

Si dudas entre las dos primeras, es el problema: un cambio que obliga a reescribir los
criterios de aceptación del REQ casi nunca es «un detalle».

## Dos tamaños de enmienda del PRD

Un PRD es por capacidad: estable, amplio y largo (los del proyecto de origen pasaban de las
mil trescientas líneas, y uno de las dos mil trescientas). Si cualquier cambio de una regla
obliga a reversionarlo entero, a archivarlo y a revisar todas sus specs, el coste no es
proporcional al cambio, y la gente acaba editándolo en el sitio. Por eso hay dos caminos:

| | **Acotada** | **Mayor** |
|---|---|---|
| Cuándo | Cumple **las tres**: (1) nombra por número cada sección que modifica; (2) no toca el resumen, el problema, los objetivos, el alcance, el reparto entre áreas ni la lista de áreas; (3) no elimina un criterio de aceptación ni hace que el PRD pase a tratar datos sensibles | Cualquier otro cambio de comportamiento |
| Cómo se publica | **Versión menor** (`X.Y` → `X.(Y+1)`) en el **mismo archivo**, que sigue en `Final` | **Versión nueva** (`(X+1).0`) en un **archivo nuevo**; el anterior queda intacto en `Superado` |
| Revisión | Solo las secciones modificadas, más su coherencia con las que no se tocaron | El PRD completo, como uno nuevo |
| Se registra | Una fila en el historial del PRD: versión, fecha, quién firma, secciones, REQ que la motiva, veredicto de la revisión | Igual, en el archivo nuevo |

Por qué esas tres condiciones: las secciones vedadas no ajustan comportamiento, **cambian la
capacidad misma** (qué áreas construyen, qué queda fuera), y eso no se revisa por partes. La
condición (1) es la que hace calculable el impacto: las tareas ya declaran de qué secciones
del PRD salen.

**Qué se revisa después de una enmienda:**

- Son **afectadas** las tareas cuyas secciones citadas incluyen una sección modificada, o
  que no citan ninguna. Quien posee la tarea las revisa y, si hace falta, las vuelve a
  destilar; cada área revisa las specs que salen de ellas.
- Una tarea **no afectada** no se reabre.
- Una tarea afectada que ya está **entregada** tampoco se reabre: el cambio de comportamiento
  se entrega con tareas nuevas.

Al revisar una enmienda, lo primero es comprobar que **es acotada de verdad**: presentar como
acotado un cambio que no lo es sería la forma más barata de saltarse la revisión completa.
Si falla cualquiera de las tres condiciones, va como versión mayor.

## Lo que no se hace

- **No editar un PRD `Final` en el sitio** salvo por una enmienda acotada, con su fila en el
  historial. Una errata (un enlace, un typo) no es una enmienda, y sí se corrige; un cambio
  de comportamiento sin historial, no.
- **No dejar el cambio solo en el hilo** del cambio o en un chat. Quien lea el REQ dentro
  de seis meses no sabrá que cambió.
- **No reabrir un REQ `Entregado`**. Si lo entregado no resuelve el problema, es un REQ
  nuevo que enlaza al anterior.
