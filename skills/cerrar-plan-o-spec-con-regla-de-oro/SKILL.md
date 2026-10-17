---
name: cerrar-plan-o-spec-con-regla-de-oro
description: Usa esta skill al terminar de ejecutar un paso de un plan o una spec bajo docs/ u openspec/ y necesitás dejar constancia escrita de lo que pasó realmente, siguiendo la "regla de oro": si la realidad difiere de lo acordado, el documento se actualiza en el mismo cambio, no queda desincronizado. Frases disparadoras: "actualiza el plan con esto", "cierra el paso X del plan", "aplica la regla de oro", "deja constancia de este hallazgo en la spec". No la uses para crear una spec nueva desde cero (eso es la plantilla de spec del proyecto, ver `documentar-decisiones`) — esta skill es solo para cerrar/actualizar un documento que ya existe y ya tiene pasos o criterios definidos.
---

# Cerrar un paso de un plan o spec con la "regla de oro"

Casi todas las specs y planes de un proyecto con SDD repiten la misma convención, casi
palabra por palabra: *"si al ejecutar un paso algo cambia respecto a lo acordado aquí, se
actualiza el documento en el mismo cambio — no queda desincronizado"*. Esta skill
estandariza **cómo** se escribe esa actualización, para no reinventar el formato cada vez ni
perder la diferencia entre "salió como se planeó" y "hubo un hallazgo no previsto" — esa
distinción es la que le da valor real al documento: un historial de decisiones reales, no una
versión limpia y retocada de lo que se planeó.

## Cuándo usarla

- Terminaste de ejecutar uno o más pasos de un plan de acción, o cerraste un criterio de
  aceptación de una spec, y hay que dejar constancia.
- Encontraste algo en el camino que **no** estaba en el plan original (un bug preexistente,
  una decisión de arquitectura que hubo que tomar sobre la marcha, un hallazgo de revisión) y
  hay que documentarlo sin que se pierda esa procedencia.

No uses esta skill para crear una spec nueva desde cero — usá la plantilla de spec que use el
proyecto (la skill `documentar-decisiones`, o la convención propia que ya tenga el proyecto).

## Antes de empezar: localizá la "regla de oro" del documento

Casi todos los documentos de planificación y las specs derivadas la declaran explícitamente
cerca del encabezado (buscá la frase "regla de oro" o "se actualiza … en el mismo
cambio/PR"). Si el documento que estás cerrando no la tiene, no la inventes — seguí el
formato de la sección de seguimiento que sí exista (p. ej. una sección "Seguimiento" al final
de la plantilla de spec del proyecto).

## Pasos

1. **Identificá qué tipo de nota estás escribiendo** — son tres cosas distintas y conviene
   no mezclarlas en un solo párrafo:
   - **(a) Paso ejecutado tal cual estaba planeado** — nota corta, "Hecho (fecha)", con el
     resultado concreto (cuántos tests, qué comando corrió limpio).
   - **(b) Hallazgo colateral no previsto en el plan original** — algo que apareció al
     ejecutar un paso y que el plan no anticipaba. Marcalo explícitamente como tal
     ("Hallazgo no previsto en el plan original: ..."), explicá la causa raíz, y qué se
     hizo al respecto.
   - **(c) Reclasificación de un ítem ya listado** — cuando la prioridad o el diagnóstico
     original de un punto del plan cambia al verificarlo contra el código real (p. ej. algo
     que se pensaba crítico resulta ser barato/no urgente, o viceversa). Nota explícita:
     "Nota de reclasificación" + el motivo del cambio de criterio.

2. **Escribí la entrada con fecha real de ejecución** (no la fecha de creación del
   documento) y, cuando aplique, el comando o verificación concreta que lo respalda — no una
   afirmación sin evidencia ("funciona bien" no alcanza; "`npm test`: 14/14" sí).

3. **Si el hallazgo (b) tiene una causa raíz ya prevista en otra spec o ADR**, citá ese
   documento explícitamente — el punto es mostrar que no fue una decisión improvisada, sino
   la ejecución de algo ya decidido en otro lado.

4. **Actualizá el campo `Estado` del encabezado del documento** si el plan/spec queda
   completo o cambia de fase (p. ej. "Aprobado, en ejecución" → "Ejecutado").

5. **Si el cambio afecta el contrato descrito en la spec** (no solo el plan derivado),
   actualizá también la spec original, no solo el plan — la regla de oro dice explícitamente
   "la spec, si el cambio afecta el contrato", no alcanza con anotarlo en el plan derivado.

## Qué NO hacer

- No reescribas secciones pasadas para que "parezca" que el plan original ya preveía el
  hallazgo — el valor de estos documentos es mostrar la deriva real entre lo planeado y lo
  ejecutado, no una versión pulida y retocada de la historia.
- No mezcles los tres tipos de nota (a/b/c) del paso 1 en un solo párrafo sin distinguirlos —
  quien lea el documento después necesita poder separar "esto salió como se esperaba" de
  "esto fue una sorpresa".
- No dejes una entrada de cierre sin verificación concreta (comando, resultado de test,
  captura de comportamiento) — una nota de cierre sin evidencia no cumple la regla de oro,
  solo la aparenta.
- No actualices solo el plan derivado si el cambio real afecta el contrato de la spec
  original — en ese caso la spec también se actualiza, en el mismo cambio.
