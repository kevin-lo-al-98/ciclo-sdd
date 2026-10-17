---
name: documentar-decisiones
description: Registra decisiones de arquitectura como ADR en formato MADR 4.0 y escribe specs en `docs/specs/`. Úsala cuando el usuario diga "ADR", "registra esta decisión", "documenta por qué elegimos…", "por qué decidimos esto", "supersede este ADR", "escribe la spec", "SPEC.md", o cuando acabe de tomarse una decisión costosa de revertir (framework, base de datos, estructura del repositorio, convención que afecta a todo el código) y no quede constancia escrita. Cubre cuándo merece la pena un ADR, la plantilla MADR, cómo superseder sin reescribir la historia y las tres condiciones de una spec útil. No la uses si el proyecto ya tiene su propio sistema de ADRs (`.adrs/`, ADR Zoom, ficheros `ADR-…` con frontmatter propio): respeta el existente. Tampoco para mensajes de commit ni para descripciones de pull request.
---

# Documentar decisiones

Un ADR (*Architecture Decision Record*) guarda el **porqué** de una decisión, que es lo
único que el código no conserva. El código dice qué se hizo; dentro de un año nadie
recordará qué alternativas se descartaron ni qué restricción las descartó, y esa
ignorancia es la que lleva a deshacer una buena decisión o a repetir una mala.

## Antes de escribir nada

Busca si el proyecto ya registra decisiones: `docs/decisions/`, `docs/adr/`, `doc/adr/`,
`.adrs/`, ficheros `NNNN-*.md` o `ADR-*.md`.

- **Ya hay MADR** (`docs/decisions/` con `0000-…`): sigue su numeración y su plantilla.
- **Hay otro formato** (Nygard, ADR Zoom, uno propio): no mezcles. Un segundo formato
  en la misma carpeta obliga a leer dos convenciones y ninguna se cumple entera.
  Escribe el ADR en el formato existente y menciona al usuario que MADR es la
  alternativa, sin migrar nada por tu cuenta.
- **No hay nada**: usa la skill `adoptar-estructura-de-docs` para montar la carpeta;
  no crees `docs/decisions/` a mano y a medias.

## Cuándo merece la pena un ADR

Escribe uno si la decisión cumple **al menos dos** de estas:

- Cuesta revertirla (cambiar de framework, de base de datos, de estructura del repo).
- Había alternativas razonables y se descartó alguna por una razón concreta.
- Afecta a más de un módulo o a quien llegue después.
- El motivo se olvidará: hoy es obvio por una restricción que dejará de existir.

No escribas un ADR para una tarea ("migrar X"), para explicar código (eso va en un
comentario) ni para una preferencia de estilo que ya cubre el linter. Un catálogo lleno
de decisiones triviales entierra las importantes, y nadie vuelve a leerlo.

## Cómo se escribe

1. **Reúne lo que falta.** Un ADR necesita el problema, los factores que pesaron y **las
   alternativas reales que se consideraron**. Si el usuario no las ha dicho, pregúntalas.
   No inventes alternativas para rellenar la sección: un ADR con opciones ficticias es
   peor que ninguno, porque documenta un análisis que nunca existió.
2. **Copia la plantilla** de [`references/plantilla-madr.md`](references/plantilla-madr.md)
   a `docs/decisions/NNNN-titulo-con-guiones.md`. `NNNN` es el siguiente número libre,
   con cuatro dígitos; el título va en minúsculas y sin acentos en el nombre del
   archivo, y en lenguaje natural dentro.
3. **Título: el problema resuelto y la solución hallada**, no el tema. "Usar Postgres
   para el catálogo" se entiende solo; "Base de datos" obliga a abrir el archivo.
4. **`status: proposed`** hasta que el usuario confirme que la decisión está tomada;
   pasa a `accepted` solo con su confirmación. Que tú la hayas redactado no la
   convierte en decisión.
5. **Las secciones opcionales se borran si no aportan.** MADR lo prevé: una sección
   vacía o con relleno es ruido. Para decisiones pequeñas usa la variante mínima de la
   misma plantilla.

Las secciones y las claves del frontmatter se dejan **en inglés**, tal como las define
MADR, y el contenido va en el idioma del proyecto. Traducir los encabezados rompería la
compatibilidad con las herramientas que leen MADR y no gana nada al lector.

### Consequences y Confirmation

- **`Consequences` incluye lo negativo.** Un ADR con solo "Good" no es un análisis, es
  un anuncio. Si no encuentras nada "Bad", no has mirado bastante.
- **`Confirmation` es opcional; ponla cuando exista una forma de comprobarlo:** una
  regla de lint, un test, una revisión concreta. Si la única verificación es manual,
  dilo así en lugar de omitirla: "se comprueba en la revisión del PR" es una
  confirmación válida y honesta.

## Cambiar una decisión

Un ADR `accepted` **no se reescribe**. La historia de por qué se decidió algo no debe
cambiar porque hoy se decida lo contrario.

1. Crea un ADR nuevo que explique el cambio y enlace al anterior.
2. En el anterior, cambia solo `status` a `superseded by ADR-NNNN`.
3. Corregir una errata o un enlace roto sí se edita en el sitio.

Un ADR `rejected` o `deprecated` se conserva: documenta lo que ya se intentó.

## Antes de proponer algo que huela a decisión

El costo de saltarse esto no es escribir de más: es implementar algo que contradice una
decisión ya `accepted` y descubrirlo en la revisión.

1. **Buscá en `docs/decisions/`** por una o dos palabras clave de tu propuesta, aunque creas
   que no hay nada registrado — puede haber una decisión que hable de lo mismo sin que el
   título lo deje ver.
2. Si alguna ADR declara `trigger`/`scope` opcionales en su frontmatter (claves adicionales
   válidas en MADR: `trigger` para cuándo traerla, `scope` para a qué rutas aplica),
   contrastá si tu propuesta lo dispara. Si el proyecto mantiene un índice de
   `docs/decisions/` con esa columna, empezá ahí en vez de abrir cada ADR a mano.
3. De las que disparan, mirá su `status`:
   - **`accepted`** — tu propuesta **no puede** contradecirla. Si hace falta cambiarla, se
     abre un ADR nuevo que la supersede; nunca se ignora en silencio.
   - **`proposed`** — todavía no es vinculante, pero avisá que existe una propuesta en
     curso sobre lo mismo antes de avanzar por tu cuenta.
   - **`rejected`** o **`deprecated`** — documenta qué ya se intentó y por qué no siguió;
     no es una obligación, pero sí una señal para no repetir el mismo camino sin saber por
     qué se abandonó.
4. Si no hay ninguna decisión que choque, seguí adelante: no hace falta un ADR para cada
   cosa que no contradice nada (ver "Cuándo merece la pena un ADR" arriba).

Esto reemplaza a un registro de dos niveles con `Enforcement: block/warn` — alcanza con el
`status` de MADR y el `trigger`/`scope` del frontmatter para decidir si algo aplica, sin
mantener una segunda copia de la decisión que pueda divergir de su ADR.

## Specs

Un ADR responde "¿por qué esto y no otra cosa?"; una **spec** responde "¿qué vamos a
construir y cómo sabremos que está hecho?". Si además hay una decisión con alternativas,
va a un ADR y la spec lo enlaza; no se repite el debate dentro de la spec.

Las specs van en `docs/specs/<nombre>.md` con la plantilla de
[`references/plantilla-spec.md`](references/plantilla-spec.md). Una spec útil cumple
tres condiciones, las mismas que recomienda la documentación de Claude Code:

1. **Es autocontenida:** nombra los archivos e interfaces implicados, de modo que quien
   la ejecute en una sesión limpia no tenga que adivinar.
2. **Declara lo que queda fuera de alcance:** sin eso, quien implementa lo amplía.
3. **Termina con una verificación de extremo a extremo** que demuestre que funciona.

## Referencias

- [`references/plantilla-madr.md`](references/plantilla-madr.md): plantilla completa y variante mínima.
- [`references/plantilla-spec.md`](references/plantilla-spec.md): plantilla de spec.
- [`references/ejemplo-adr.md`](references/ejemplo-adr.md): un ADR bien escrito y uno flojo, comparados.
