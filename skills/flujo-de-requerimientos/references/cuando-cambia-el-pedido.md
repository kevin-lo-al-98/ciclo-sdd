# Qué hacer cuando el pedido cambia a mitad de camino

Pasa siempre. Lo que cambia es el coste, que depende de **dónde** esté el cambio. La regla
común: lo que ya se firmó o se especificó contra un documento no se reescribe en silencio;
se versiona, para que se pueda rastrear qué se construyó contra qué versión.

| El cambio afecta | Qué se hace | Por qué |
|---|---|---|
| **El problema mismo** | Un REQ nuevo. El anterior se cierra como `Descartado` o se acota, con el motivo escrito | Si el problema cambió, lo especificado hasta ahora responde a otro; mezclarlo en el mismo REQ borra esa frontera |
| **El comportamiento, con el PRD ya `Final`** | Versión nueva del PRD (no se edita en el sitio) y revisión de las specs derivadas | Las specs ya escritas apuntan a una versión; editarla debajo de ellas las deja contradiciéndose sin que nadie lo vea |
| **Un detalle que la spec resolvió por su cuenta** | Se corrige en la spec; si la decisión era de producto, se sube al PRD | Una decisión de comportamiento tomada en una spec es invisible para las otras áreas |
| **Una decisión técnica ya tomada** | ADR nuevo, el anterior `superseded`. El cuerpo de un ADR aceptado no se edita | La historia de por qué se decidió algo no debe cambiar porque hoy se decida lo contrario |
| **Un REQ ya `Aceptado` (alcance o criterios)** | Se anota en la sección «Historial» del REQ con fecha y quién; si cambia lo que las áreas aceptaron, se vuelve a pedir su confirmación | Lo que las áreas aceptaron fue el enunciado anterior |

## Cómo decidir cuál de las filas es

Pregunta en este orden y detente en la primera que sea afirmativa:

1. ¿Cambió **qué problema hay** o **para quién**? → REQ nuevo.
2. ¿Cambió **cómo se comporta** el producto? → versión nueva del PRD.
3. ¿Cambió **cómo se construye** sin cambiar el comportamiento? → ADR o spec, según el caso.

Si dudas entre las dos primeras, es el problema: un cambio que obliga a reescribir los
criterios de aceptación del REQ casi nunca es «un detalle».

## Lo que no se hace

- **No editar un PRD `Final` en el sitio**, ni siquiera para corregir «una cosita»: si es
  una errata (un enlace, un typo), sí; si cambia el comportamiento, no.
- **No dejar el cambio solo en el hilo** del cambio o en un chat. Quien lea el REQ dentro
  de seis meses no sabrá que cambió.
- **No reabrir un REQ `Entregado`**. Si lo entregado no resuelve el problema, es un REQ
  nuevo que enlaza al anterior.
