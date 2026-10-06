# Plantilla de requerimiento

Ubicación: `requerimientos/REQ-NNN-<slug>.md` (o la carpeta que el proyecto ya use; ver el
registro). `NNN` es el próximo número libre del [registro](registro-de-trazabilidad.md), y
la fila del registro se añade **en el mismo cambio**.

Los comentarios `<!-- … -->` son instrucciones: se borran al escribir. En la versión ligera
se omiten las secciones «Validación» y «Viabilidad» y el frontmatter correspondiente, y
queda una sola confirmación de quien pide y de quien construye.

```markdown
---
tipo: requerimiento
id: REQ-NNN
titulo: Enunciado del problema en una línea, sin nombrar la solución
estado: Borrador          # Borrador → Recibido → Validado → Aceptado → En PRD → Entregado | Descartado
solicitante: nombre-de-quien-lo-pide
areas-impactadas: []      # las áreas que construirán algo; vacío mientras no se sepa
validacion:               # obligatorio desde `Validado`
  modo:                   # prototipo | solicitante
  firmada-por:            # nombre propio de quien valida
  fecha:                  # AAAA-MM-DD
viabilidad:               # una entrada por área impactada; obligatorio desde `Aceptado`
  # area-1:               # nombre propio de quien acepta por esa área
fecha-alta: AAAA-MM-DD
fecha-validacion:
fecha-aceptacion:
fecha-entrega:
prd: —
---

# REQ-NNN — {mismo título del frontmatter}

## Problema

<!-- Qué no funciona hoy, en lenguaje de negocio. Dos o tres párrafos, no más.
     Prueba de que está bien escrito: se entiende sin nombrar ninguna pantalla,
     tabla, endpoint ni componente. Si no pasa esa prueba, todavía es una solución
     disfrazada de problema. -->

## Quién lo sufre

<!-- El rol concreto y, si se sabe, el volumen: «quien atiende pedidos, en los ~40
     que recibe por turno». «El usuario» no sirve. -->

## Valor u obligación

<!-- Qué se gana (tiempo, error evitado, ingreso) o qué exige una norma o contrato.
     Si es una obligación, la cita exacta. -->

## Alcance

<!-- Qué entra. Lista corta y concreta. -->

## Fuera de alcance

<!-- Qué NO entra, aunque parezca natural que entre. Este campo es el que más
     discusiones ahorra tres semanas después: escríbelo aunque parezca obvio. -->

## Criterios de aceptación de negocio

<!-- Observables por quien pidió el requerimiento, sin hablar de implementación. NO
     son los escenarios de la spec: esos los escribe cada área. Numerados para poder
     citarlos: CA-1, CA-2… -->

- **CA-1** —
- **CA-2** —

## Datos y fuentes que involucra

<!-- Qué información se toca y de dónde sale. Si toca datos personales o sensibles,
     dilo aquí: puede exigir una revisión específica en el PRD. -->

## Material adjunto

<!-- Enlaces a diseños, hojas de cálculo, transcripciones o correos. Van como
     ILUSTRACIÓN del problema, nunca como el requisito. -->

## Preguntas abiertas

<!-- Se sube CON las preguntas sin responder. Numeradas (Q-1, Q-2…) y con dueño:
     quién tiene que contestarlas. Un requerimiento con huecos declarados es
     utilizable; uno que los esconde, no. -->

| # | Pregunta | Quién responde | Estado |
|---|---|---|---|
| Q-1 | | | Abierta |

## Validación

<!-- Etapa 2: confirmar que el problema enunciado es el problema real. Sin esta
     sección firmada, el REQ no pasa de `Recibido`.

     · `prototipo`   — pide pantalla o interacción nueva; quien valida lo vio
                       funcionando y lo dijo de forma explícita.
     · `solicitante` — no pide interfaz; se valida contra quien lo pidió, y aquí se
                       dice por qué no hace falta prototipo.

     La firma es nominal: una persona con nombre propio, no un rol ni un área. -->

- **Modo**:
- **Prototipo**: <!-- ruta, o «no aplica: no pide interfaz» -->
- **Qué se confirmó**: <!-- qué quedó claro que el problema SÍ es -->
- **Qué cambió del enunciado**: <!-- si la validación lo corrigió, aquí; si no cambió nada, dilo: también es un resultado -->
- **Firmada por**: <!-- nombre propio --> · **Fecha**: <!-- AAAA-MM-DD -->

<!-- Si la validación NO pasa, el REQ no avanza: el hallazgo se escribe igual y el
     estado se queda en `Recibido`. -->

## Viabilidad

<!-- Etapa 3: cada área impactada dice si lo entiende, si es viable y qué le toca, y
     firma con nombre propio. Sin la firma de todas las áreas impactadas no hay
     `Aceptado`. Un área no impactada no firma ni escribe aquí.

     Si un área rebota el REQ —trae solución técnica, impone un diseño de pantalla,
     o mezcla más de un problema—, el rebote y su motivo se escriben aquí y vuelve
     a quien lo pidió. -->

| Área | Firma | Fecha | Qué le toca y notas técnicas preliminares |
|---|---|---|---|
| | | | |

## Historial

<!-- Toda modificación posterior a `Aceptado` se anota aquí. No se reescribe el cuerpo
     en silencio: lo que ya se especificó contra este REQ tiene que poder rastrearse. -->

| Fecha | Quién | Qué cambió |
|---|---|---|
| AAAA-MM-DD | | Alta |
```

## Qué rebota un requerimiento

Si lo trae, vuelve a quien lo pidió con el motivo concreto:

- **Solución técnica** (endpoints, tablas, componentes, framework): el equipo técnico pierde
  la decisión que le corresponde y el ADR queda sin alternativas que comparar.
- **Un diseño de pantalla como requisito**: un diseño se adjunta como ilustración; el
  requisito es el comportamiento.
- **Estimaciones o fechas de entrega**: van a la planificación, no al enunciado del problema.
- **Varios problemas en un solo REQ**: uno por documento.
