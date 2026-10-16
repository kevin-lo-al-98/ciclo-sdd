# Dónde se atasca la cadena

Lo que el proyecto de origen encontró al **auditar su propio flujo en papel**, antes de que el
primer requerimiento lo recorriera, y qué decidió hacer. Sirve para dos cosas: evitar los
mismos atascos al montar la cadena, y auditar la tuya cuando ya esté en marcha.

> **Qué es y qué no es.** Son hallazgos de **diseño**, sacados de leer las reglas y de
> ejecutar el validador sobre un árbol de prueba. Ningún requerimiento había recorrido el
> ciclo, así que **no hay tiempos medidos** y aquí tampoco se inventan. Que un atasco aparezca
> en esta lista no prueba que se vaya a dar en tu proyecto; prueba que el diseño lo permite.

## El método, por si quieres repetirlo

1. **Una tabla etapa × quién actúa × quién firma × qué archivo edita × quién revisa ese
   archivo.** La columna del archivo es la que enseña los problemas: cuando el área que
   construye tiene que editar un archivo de producto, hay un cruce de fronteras.
2. **Cuenta los cambios de una sola tarea de una sola área**, de punta a punta. Cada regla se
   había medido por separado y cada una era tolerable; la suma, ocho cambios en serie con el
   revisor cambiando de lado cinco veces, no aparecía en ningún documento.
3. **Marca quién es punto único** en cada etapa: la persona cuya ausencia detiene algo.
4. **Busca los controles prometidos que no existen**: una válvula que el plan describe y que
   ninguna regla ni validador implementa.

## Los hallazgos, generalizados

| Atasco | Qué pasaba | Qué se decidió | Dónde está |
|---|---|---|---|
| **Punto único** | Una sola persona de producto firmaba la validación del REQ, la de cada tarea y su cierre: 2 + 2*N* firmas por REQ con *N* tareas, y su ausencia frenaba todo a la vez | Lista cerrada y nominal de suplentes; firma única en `E1`; el cierre de la tarea sale de producto | [`variante-con-firmas.md`](variante-con-firmas.md) §1 |
| **El área escribe en el archivo del otro** | El área reportaba avance dentro de la tarea de producto; cada reporte era un cambio aparte, revisado por el otro lado | El área reporta en un archivo de su propia spec; el avance se deriva | [`reporte-del-area.md`](reporte-del-area.md) |
| **Válvulas que no existen** | El plan prometía firma por lotes, plazo de firma y excepción con motivo; solo existía la tercera | Corregir el plan para no prometer lo que no hay; aviso de firma pendiente que no bloquea; el lote espera a tener tareas reales | [`variante-con-firmas.md`](variante-con-firmas.md) §4 |
| **Plazo duro con radio global** | Un hotfix sin su REQ a los cinco días hábiles rompía la comprobación de **todo** el repositorio, y quien lo sufría no podía arreglarlo | El plazo vencido bloquea solo el cambio que toca esa tarea; para el resto, aviso | [`plantilla-tarea.md`](plantilla-tarea.md) |
| **Área declarada sin salida** | Un REQ que impactaba un área sin capacidad de especificar ni cerrar quedaba detenido para siempre; quitar el área de la lista para no esperarla era justo el antipatrón | Se preguntó si el área construye hoy; la respuesta fue que sí, y se le exigió su propia spec y definición de terminado. La alternativa, un estado explícito «área declarada sin capacidad de construir», habría exigido una decisión nueva | Si declaras un área, que pueda cerrar |
| **La viabilidad espera al área más lenta** | Sin regla sobre el rebote, cada corrección podía reabrir las firmas de todas las áreas | Re-firma de todas solo si la corrección toca el problema o los criterios; si no, solo la que rebotó | [`flujo-y-duenos.md`](flujo-y-duenos.md) etapa 3 |
| **Reversionar un PRD de mil líneas por una regla** | Cualquier cambio de comportamiento costaba un archivo nuevo, archivar el anterior y revisar todas las specs | Enmienda acotada con versión menor, con tres condiciones comprobables | [`cuando-cambia-el-pedido.md`](cuando-cambia-el-pedido.md) |
| **Estados sin plazo** | `Recibido`, `Validado`, `Aceptado`, `Lista` podían quedarse meses sin que nada lo avisara, y el detector se iba a construir cuando un REQ **ya hubiera terminado**: el primer atasco no lo vería nadie | Aviso por días en el mismo estado, calculado con las fechas existentes; el umbral (10 días hábiles) es una propuesta, no una regla | [`variante-con-firmas.md`](variante-con-firmas.md) §4 |
| **Los registros son contención compartida** | Todos los roles tocaban el registro en todas las transiciones; el de tareas copiaba estado y avance y los dos lados volvían a editar la misma línea | El registro de tareas queda como índice, y su número se deriva del mayor archivo | [`registro-de-trazabilidad.md`](registro-de-trazabilidad.md) |
| **Un cambio no avisa a quien afecta** | Una decisión de un área podía cambiar lo que otra construía sin que nada la obligara a verlo | Se declara donde nace y la afectada la firma | [`reporte-del-area.md`](reporte-del-area.md) |
| **La IA clasifica sin control** | La herramienta que destila tareas asignaba áreas y nivel de evidencia sin que nadie comprobara | Las áreas de la tarea salen de las del REQ; un nivel bajo ante datos sensibles es hallazgo | [`flujo-y-duenos.md`](flujo-y-duenos.md) etapa 5 |
| **El hotfix se regulariza con cualquier cosa** | Bastaba una fila en el registro, aun en `Borrador`, para dar por regularizado el hotfix | Un REQ nuevo, en `Validado` como mínimo, que cita un REQ de referencia | [`plantilla-tarea.md`](plantilla-tarea.md) |

## Dos cosas que el origen aceptó sin arreglar

- **Dos cambios por cada acto transversal** (uno de producto, otro de construcción). Es el
  precio de separar los dos lados, y no se intentó abaratarlo.
- **Una herramienta visual de gestión de tareas** puede coexistir con la cadena, pero solo
  como **proyección de solo lectura** del repositorio: si también se edita allí, vuelve la
  doble fuente de estado que se acababa de quitar.

## Pausa de un REQ: la propuesta que no llegó a decisión

El origen detectó que no hay dónde registrar que un REQ está **detenido** (por un hotfix que
lo desplaza, por una decisión de producto, por una decisión del área o por falta de claridad)
y propuso modelarlo como un **bloque del frontmatter** con motivo, quién y desde cuándo, y no
como un estado nuevo: así el REQ conserva la etapa donde estaba y la retoma desde ahí. **Es una
recomendación, no una regla vigente**: no se escribió como decisión. Si la necesitas, es un
punto de partida razonable, no una práctica probada.
