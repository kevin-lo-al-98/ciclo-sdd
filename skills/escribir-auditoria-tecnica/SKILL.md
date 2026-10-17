---
name: escribir-auditoria-tecnica
description: 'Usa esta skill al producir un documento de análisis/auditoría independiente bajo docs/ — auditar un sistema existente, un archivo de configuración o una fuente externa (no una spec de feature, no un README) para dejar una base documentada de la que partir más adelante. Frases disparadoras: "documenta y analiza X", "haz un audit de X", "necesito documentación de X antes de migrar", "deja esto documentado para más adelante".'
---

# Escribir un documento de auditoría/análisis técnico

Esta skill estandariza los documentos de análisis que viven sueltos bajo `docs/` (no como
spec dentro de `openspec/`, no como README) — el tipo de documento que audita algo que ya
existe (un archivo de config, un esquema, una fuente de datos externa) para dejar una base
documentada de la que partir después, sin todavía tomar decisiones de implementación.

## Cuándo usarla

- El usuario pide "documentar y analizar" algo que ya existe en el código o en un sistema
  externo, para consulta futura (no para implementar ya).
- Se necesita un inventario/mapeo exhaustivo de una fuente grande (un archivo de
  configuración, una hoja de estilos, un catálogo) antes de decidir cómo migrarlo o
  modelarlo.
- El resultado se va a guardar en `docs/` como referencia permanente, no como una nota de
  una sola conversación.

No uses esta skill para:
- **Specs de feature** → la skill de creación de specs/features propia del proyecto (sigue
  su propio flujo de aprobación, plantilla y criterios).
- Documentación que ya tiene su propio formato fijado (README de proyecto, ADR) — no le
  apliques esta estructura, seguí la de ese documento.

## Antes de escribir: recolectá el contexto

1. **¿Cuál es la decisión futura que este documento habilita?** Un audit sin propósito
   declarado es solo una transcripción — el objetivo (p. ej. "para poder modelar X más
   adelante") va en la primera línea.
2. **¿Cuál es la fuente exacta auditada?** Ruta completa del archivo, tamaño (líneas),
   codificación si es relevante, y cualquier nota de versión que traiga la fuente misma.
3. Si la fuente es grande (más de ~700-800 líneas), **usá un fork/subagente para leerla
   completa** en vez de cargarla entera en el contexto principal, si el usuario lo pide o
   autoriza. Dirigilo con el propósito, la estructura esperada del documento final, y qué
   archivos del repo debe cruzar (ver punto 4). Si no, leela por tramos con
   `offset`/`limit` saltando el ruido (p. ej. bloques en base64).
4. **Cruzá contra el código/docs real del repo** antes de afirmar "esto ya existe" o "esto
   no existe" — buscá por los identificadores relevantes en el código y en `docs/`. No es un
   documento aislado: debe decir explícitamente qué de lo auditado ya tiene equivalente en el
   código (con `ruta:línea`) y qué no.

## Estructura del documento

1. **Título + blockquote de propósito** al inicio: por qué existe este documento, qué
   decisión futura habilita. Una o dos frases, no una introducción larga.
2. **Fuente auditada**, declarada explícitamente (ruta, tamaño, notas de versión de la
   fuente misma).
3. **Nota de vigencia**: una línea corta advirtiendo que el documento es una foto de la
   fuente en ese momento, y que debe revisarse si la fuente cambia.
4. **Índice con anclas**, si el documento supera ~150-200 líneas o tiene más de 5
   secciones — de lo contrario es más ruido que ayuda.
5. **Cuerpo organizado en secciones temáticas**, preferiblemente siguiendo el propio
   orden/estructura de la fuente auditada (no inventar una taxonomía nueva si la fuente ya
   tiene una).
6. **Trazabilidad**: cada afirmación relevante debe poder verificarse — número de línea o
   rango en la fuente, `ruta:línea` en el código cruzado, o cita del spec/doc relacionado.
   Evitá resúmenes sin ancla que obliguen a releer la fuente completa para confirmar algo.
7. **Sección de hallazgos/riesgos**, separada del inventario: ambigüedades,
   inconsistencias, datos faltantes. Cada hallazgo ambiguo se marca explícitamente
   **"pendiente de confirmar"** — nunca se rellena con una suposición razonable disfrazada
   de hecho.
8. **Checklist consolidado de preguntas abiertas**, en una sección propia, con un ítem por
   cada "pendiente de confirmar" que haya aparecido en el cuerpo (enlazado a su hallazgo
   completo). No lo disperses solo dentro del cuerpo — alguien debe poder llevar esta
   sección sola a una reunión de revisión sin releer todo el documento.
9. **Sección final de próximos pasos**, si aplica, marcada explícitamente como propuesta
   pendiente de validación, no como decisión tomada:
   ```
   > **[PROPUESTA, pendiente de validación]** — ...
   ```
   Puede sugerir la *forma* general de una solución futura (qué campos tendría un catálogo,
   qué servicio lo expondría), pero sin escribir código ni tratarlo como decisión tomada.

## Qué NO hacer

- No inventes valores, códigos, ni relaciones que no estén en la fuente — si algo es
  ambiguo, va al checklist de preguntas abiertas, no se resuelve por conjetura.
- No mezcles la fase de auditoría con la fase de implementación: un documento de audit no
  crea servicios, componentes ni constantes de código — solo dirige hacia una spec cuando
  llegue el momento de implementar.
- No dejes notas de borrador sueltas en el texto final (asides tipo "ojo, esto es distinto"
  a medio resolver) — si algo necesita aclararse, resolvelo en su propio hallazgo con
  referencia cruzada, no como paréntesis informal dentro de una tabla.
- No omitas agregar el documento nuevo a la tabla de fuentes de verdad del proyecto (su
  `CLAUDE.md` o README), si el proyecto mantiene una — en el mismo cambio, o quedará
  invisible para la próxima persona (humana o Claude) que pregunte "¿dónde está esto
  documentado?".
