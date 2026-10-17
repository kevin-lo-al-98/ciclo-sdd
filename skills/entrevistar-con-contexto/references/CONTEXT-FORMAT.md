# Formato de CONTEXT.md

## Estructura

```md
# {Nombre del contexto}

{Una o dos frases describiendo qué es este contexto y por qué existe.}

## Lenguaje

**Pedido**:
{Una descripción concisa del término}
_Evitar_: Compra, transacción

**Factura**:
Un requerimiento de pago enviado a un cliente después de la entrega.
_Evitar_: Boleta, solicitud de pago

**Cliente**:
Una persona u organización que hace pedidos.
_Evitar_: Comprador, cuenta

## Relaciones

- Un **Pedido** produce una o más **Facturas**
- Una **Factura** pertenece exactamente a un **Cliente**

## Diálogo de ejemplo

> **Dev:** "Cuando un **Cliente** hace un **Pedido**, ¿generamos la **Factura** de
> inmediato?"
> **Experto de dominio:** "No — una **Factura** solo se genera una vez que se confirma un
> **Envío**."

## Ambigüedades marcadas

- "cuenta" se usaba para referirse tanto a **Cliente** como a **Usuario** — resuelto: son
  conceptos distintos.
```

## Reglas

- **Sé decidido.** Cuando existan varias palabras para el mismo concepto, elegí la mejor y
  listá las demás como alias a evitar.
- **Marcá los conflictos explícitamente.** Si un término se usa de forma ambigua, señalalo
  en "Ambigüedades marcadas" con una resolución clara.
- **Mantené las definiciones ajustadas.** Una frase como máximo. Definí qué ES, no qué
  hace.
- **Mostrá las relaciones.** Usá los nombres de término en negrita y expresá la
  cardinalidad cuando sea evidente.
- **Incluí solo términos específicos del contexto de este proyecto.** Los conceptos
  generales de programación (timeouts, tipos de error, patrones utilitarios) no van acá
  aunque el proyecto los use mucho. Antes de agregar un término, preguntate: ¿es un
  concepto propio de este contexto, o un concepto general de programación? Solo el primero
  va acá.
- **Agrupá los términos bajo subtítulos** cuando surjan clústeres naturales. Si todos los
  términos pertenecen a un área cohesiva, una lista plana está bien.
- **Escribí un diálogo de ejemplo.** Una conversación entre alguien del equipo técnico y un
  experto de dominio que muestre cómo interactúan los términos de forma natural y aclare
  los límites entre conceptos relacionados.

## Repos de uno o varios contextos

**Un solo contexto (la mayoría de los repos):** un `CONTEXT.md` en la raíz del repo.

**Varios contextos:** un `CONTEXT-MAP.md` en la raíz lista los contextos, dónde viven y cómo
se relacionan entre sí:

```md
# Mapa de contextos

## Contextos

- [Pedidos](./src/ordering/CONTEXT.md) — recibe y rastrea los pedidos de los clientes
- [Facturación](./src/billing/CONTEXT.md) — genera facturas y procesa pagos
- [Despacho](./src/fulfillment/CONTEXT.md) — gestiona el picking y el envío en depósito

## Relaciones

- **Pedidos → Despacho**: Pedidos emite eventos `OrderPlaced`; Despacho los consume para
  arrancar el picking
- **Despacho → Facturación**: Despacho emite eventos `ShipmentDispatched`; Facturación los
  consume para generar facturas
- **Pedidos ↔ Facturación**: tipos compartidos para `CustomerId` y `Money`
```

La skill infiere qué estructura aplica:

- Si existe `CONTEXT-MAP.md`, lo lee para encontrar los contextos.
- Si solo existe un `CONTEXT.md` en la raíz, es un solo contexto.
- Si no existe ninguno, crea un `CONTEXT.md` en la raíz de forma perezosa cuando se
  resuelve el primer término.

Cuando existen varios contextos, infiere a cuál se refiere el tema actual. Si no está
claro, pregunta.
