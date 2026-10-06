---
name: mantener-claude-md
description: Mantiene corto y útil el `CLAUDE.md` (o `AGENTS.md`) de un proyecto — decide qué merece estar en un archivo que se carga entero en cada sesión y a dónde va lo demás (índice de documentación, ADR, skill, `CLAUDE.md` de una subcarpeta) — y fija el protocolo para que el agente consulte un índice en lugar de abrir archivos en cascada. Úsala cuando el usuario diga "mi CLAUDE.md es enorme", "recorta el CLAUDE.md", "qué meto en CLAUDE.md", "dónde pongo esta regla", "el contexto se llena enseguida", "el agente lee demasiados archivos", "lee archivos enteros", "monta un índice de la documentación", "protocolo de contexto", "hook para lecturas pesadas", o cuando un `CLAUDE.md` pase de unas 200 líneas o unos 7 KB. No la uses para decidir si algo merece un ADR (`documentar-decisiones`), para generar un `CLAUDE.md` desde cero con `/init`, ni para configurar permisos o hooks en general.
---

# Mantener el CLAUDE.md corto y útil

`CLAUDE.md` se carga **entero, en cada sesión, antes de que el agente sepa cuál es la
tarea**. Es el único coste de contexto que se paga siempre: cada línea se multiplica por
cada sesión de cada persona, también por las que nunca la necesitan. Y hay un segundo
coste: en un archivo largo las reglas importantes se diluyen entre las que no lo son, y
se obedecen peor. La documentación de Claude Code recomienda mantenerlo por debajo de
unas 200 líneas.

Por eso la pregunta al tocar este archivo no es «¿esto es verdad?» sino «¿esto se
merece pagarse en todas las sesiones?».

## Idioma

Escribe el índice y el `CLAUDE.md` recortado en el idioma del proyecto: míralo en su
`CLAUDE.md` y en su documentación existente. Si no está claro, pregunta. Los nombres de
archivo y los identificadores no se traducen.

## 1. Mide antes de recortar

```bash
wc -c CLAUDE.md    # bytes
wc -l CLAUDE.md    # líneas
```

Fija un **techo en bytes** y escríbelo en la cabecera del propio archivo. Como punto de
partida, unos 7 KB. El número no es sagrado; lo que importa es que exista y que alguien
lo compruebe, porque sin número nadie sabe cuándo se pasó. Se mide en bytes y no en líneas
porque una línea puede tener 20 caracteres o 400.

Si el proyecto tiene `CLAUDE.md` en subcarpetas, esos se cargan solo al trabajar allí y
toleran un techo mayor, pero no libre: cada KB se multiplica por cada sesión de esa zona.

## 2. Aplica las dos preguntas

Una línea merece estar en el `CLAUDE.md` raíz solo si cumple **las dos**:

- **Aplica a toda tarea**, en cualquier zona del proyecto.
- **No se descubre barato en otro sitio**: leyendo el código, un `package.json`, un listado.

Lo que falla alguna tiene un destino mejor:

| Qué es | A dónde va |
|---|---|
| Decisión con alternativas que costó tomar | Un ADR; el `CLAUDE.md` deja la regla y el enlace |
| Regla que solo aplica a una subcarpeta | El `CLAUDE.md` de esa subcarpeta |
| Procedimiento repetible de varios pasos | Una skill |
| Lista de documentos y para qué sirve cada uno | Un índice (`docs/INDEX.md`) |
| Comando, estructura o convención que se deduce del código | Fuera: se descubre leyendo |
| Historia de por qué se hizo algo | Un ADR o el historial de git |

Ejemplos de cada caso, con un antes y un después, en
[`references/que-va-donde.md`](references/que-va-donde.md).

## 3. Deja un puntero con disparador

Quitar una regla sin dejar rastro la pierde. Dejar un enlace sin decir cuándo seguirlo
lo convierte en un documento que nadie abre. El puntero lleva las dos cosas: **dónde está**
y **cuándo traerlo**.

```markdown
| Fuente | Qué fija |
|---|---|
| [`docs/INDEX.md`](docs/INDEX.md) | Punto de partida: qué documento responde cada pregunta |
| [`docs/decisions/`](docs/decisions/) | Por qué se decidió cada cosa; consúltalo antes de cuestionar una decisión |
```

## 4. Monta el índice y el protocolo de lectura

El `CLAUDE.md` recortado funciona porque el agente tiene adónde ir: un **índice** con una
fila por documento y una columna «Traer cuando». Y porque `CLAUDE.md` le dice que lo use
en lugar de leer en cascada. Plantilla del índice y texto del protocolo en
[`references/protocolo-de-contexto.md`](references/protocolo-de-contexto.md).

Si el proyecto registra ADRs con `trigger` en el frontmatter (ver `documentar-decisiones`),
el índice los proyecta tal cual: no se escribe dos veces.

## 5. Lecturas pesadas: el hook

La disciplina de «consulta el índice y salta al documento» escrita solo en prosa la lee
un agente que puede ignorarla. Un hook de `PreToolUse` sobre `Read` la ejecuta el
harness: deniega la lectura entera de un archivo grande y sugiere `grep`, un rango o el
subagente Explore. Esta skill **describe** el hook y su configuración, pero no incluye
el script: [`references/hook-lectura-pesada.md`](references/hook-lectura-pesada.md).

## Lo que no se hace

- **No abrevies la prosa para ganar bytes.** Un telegrama pierde el porqué, y una regla sin
  porqué se ignora en cuanto estorba. Mueve el contenido, no lo comprimas.
- **No subas el techo sin contestar las dos preguntas.** Subir el número es la salida fácil
  y el archivo vuelve a crecer hasta el nuevo techo.
- **No borres una regla sin destino.** Si no cabe en ningún sitio de la tabla, o es derivable
  del código o ya no aplica; díselo al usuario en lugar de decidirlo en silencio.
- **No cites secciones por su nombre desde otros documentos** (`CLAUDE.md §Comandos`):
  renombrar la sección rompe la cita sin avisar. Enlaza al archivo.

## Antes de dar el recorte por bueno

1. Vuelve a medir: el archivo está por debajo del techo y el techo está escrito en él.
2. Cada puntero resuelve a un archivo que existe y dice cuándo traerlo.
3. Nada de lo movido quedó duplicado: o está en el `CLAUDE.md` o en su destino.
4. Cada regla que se quedó conserva su porqué en una frase.

## Referencias

- [`references/que-va-donde.md`](references/que-va-donde.md): el criterio con un recorte de ejemplo, antes y después.
- [`references/protocolo-de-contexto.md`](references/protocolo-de-contexto.md): plantilla del índice y texto del protocolo.
- [`references/hook-lectura-pesada.md`](references/hook-lectura-pesada.md): comportamiento y configuración del hook.
