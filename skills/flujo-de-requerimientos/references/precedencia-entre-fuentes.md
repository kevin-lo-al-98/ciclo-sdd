# Precedencia entre fuentes

Cuando dos documentos se contradicen, hace falta una regla que diga cuál gana **antes** de
que aparezca el conflicto. Sin ella, cada persona resuelve el choque a su favor y el
resultado depende de quién llegó primero a la reunión.

## La regla de fondo

**Quien pide manda en el qué; quien construye manda en el cómo.**

- Un PRD que prescribe implementación no obliga en esa parte: se trata como una sugerencia,
  y la decisión técnica se escribe en un ADR.
- Una spec que contradice el comportamiento del PRD está mal. Se corrige **levantando el
  tema contra el dueño del PRD**, no ajustando la spec: si la spec gana en silencio, el
  comportamiento del producto lo decide quien escribió la spec sin que nadie lo haya
  aprobado.

## La tabla, para rellenar por proyecto

Cada proyecto fija la suya. Esta es la base; borra las filas que no apliquen y añade las que
falten:

| Materia | Manda | Por qué |
|---|---|---|
| Comportamiento, reglas de negocio, catálogos, terminología | **PRD** | Es la decisión del dueño del producto |
| Decisiones técnicas: arquitectura, framework, dependencias | **ADR** | Un PRD no impone arquitectura |
| Composición de pantalla donde el PRD no baja al detalle | **Diseño vigente** (mockup o prototipo) | El PRD describe comportamiento; el diseño tiene el píxel |
| Identidad visual: color, tipografía, logotipo | **Guía de marca** | Ni el PRD ni el diseño la sobrescriben |
| Cómo se verifica que algo está hecho | **Spec** | Es el contrato verificable |

Escribe la tabla en un sitio que el índice enlace, y nómbrala en la cabecera del PRD. Si el
proyecto tiene un documento de «reglas de negocio», decide en esta tabla si obliga o solo
informa.

## Rango por documento (opcional)

Para el conocimiento de dominio que no es PRD ni ADR (glosarios, documentos de contexto,
extractos de normas), conviene que **cada documento declare su rango** en el frontmatter:

```yaml
rango: obliga        # obliga | informa
alcance: ...         # a qué materias aplica
fundamento: ...      # de qué fuente deriva esa autoridad
```

- **`obliga`**: gana a una spec que lo contradiga.
- **`informa`**: no gana contra nada. La ausencia del campo se lee como `informa`.
- **La ubicación no confiere rango.** Una carpeta `contexto/` no hace obligatorio todo lo
  que contiene; si lo hiciera, un parámetro configurable pasaría a invariante por haber
  caído en la carpeta equivocada.
- **Un documento obliga solo en tanto repite fielmente la fuente que nombra** en
  `fundamento`. Donde se desvía, gana la fuente. Así un documento obsoleto no puede
  imponerse: su autoridad se mide contra algo que sí está al día.

Por qué importa: un documento que «cede ante todo lo posterior» es indistinguible de uno
desactualizado, porque el mecanismo de precedencia y el de caducidad son el mismo. Declarar
el fundamento los separa.

Es opcional. Si el proyecto no tiene documentos de este tipo, no lo montes.
