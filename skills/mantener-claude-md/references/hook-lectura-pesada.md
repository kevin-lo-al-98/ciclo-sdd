# Hook contra las lecturas pesadas

Esta skill **describe** el hook y su configuración. No incluye el script: la librería no
lleva código fuera de `mcp/`. Quien lo adopte puede pedirle a Claude que lo escriba en el
lenguaje que ya use el proyecto a partir de esta especificación.

> **Estado.** El diseño sale de un proyecto que lo tiene en uso. Esta descripción no se ha
> probado en otros proyectos; pruébalo en el tuyo antes de depender de él.

## Para qué sirve

El protocolo de contexto («consulta el índice y salta al documento») escrito en prosa lo
lee un agente que puede ignorarlo o no llegar nunca a él. Un hook lo ejecuta el harness, no
el modelo. Pero no intenta forzar «entra por el índice»: eso es comportamiento y no hay
forma de verificarlo. Ataca un fallo concreto y caro: un `Read` **sin rango** sobre un
archivo grande, que se lleva decenas de miles de tokens de golpe, casi siempre para buscar
un dato que un `grep` habría encontrado.

## Comportamiento

Evento `PreToolUse` sobre la herramienta `Read`:

1. Si la llamada trae `offset` o `limit`, **permitir**. Un rango explícito ya es una
   decisión consciente.
2. Si el archivo no existe, es binario o no se puede leer, **permitir**: no es asunto del hook.
3. Si el archivo tiene más de N líneas (umbral inicial: 500), **denegar** con un mensaje
   que diga cuántas líneas tiene, cuánto cuesta aproximadamente (del orden de 10 tokens por
   línea de prosa) y qué alternativas hay: `grep` con el término buscado, el subagente
   Explore para barridos, un `Read` con `offset`/`limit`, o el índice si todavía no se sabe
   qué documento responde la pregunta.
4. En cualquier otro caso, **permitir**.

El agente puede reintentar con un `limit` explícito si de verdad necesita el archivo
entero. La lectura cara deja de ser accidental y pasa a ser una decisión.

### Falla siempre hacia permitir

Cualquier error interno —entrada ilegible, excepción, archivo que desaparece— debe dejar
pasar el `Read`. Un hook roto que bloquea el trabajo cuesta más que el fallo que evita.

## Contrato con Claude Code

El hook recibe en la entrada estándar un JSON con `tool_input.file_path` y, si existen,
`tool_input.offset` y `tool_input.limit`. Para permitir, termina con código 0 sin escribir
nada. Para denegar, escribe en la salida estándar:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "<mensaje para el agente>"
  }
}
```

y termina con código 0.

## Configuración

En `.claude/settings.json` del proyecto (compartida con el equipo):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "<comando que ejecuta tu script>",
            "timeout": 10,
            "statusMessage": "Comprobando el tamaño del archivo…"
          }
        ]
      }
    ]
  }
}
```

Para un script de Node, `<comando…>` sería `node scripts/hooks/guard-lectura-pesada.mjs`;
para otro lenguaje, el equivalente. Si el proyecto ya tiene un bloque `hooks`, **añade** la
entrada; no lo sustituyas.

## Decisiones de diseño que conviene mantener

- **El umbral es una cifra del proyecto, no una verdad.** 500 líneas es un punto de
  partida. Si el proyecto tiene documentos grandes que sí se leen enteros con frecuencia,
  súbelo; si el contexto se llena igual, bájalo.
- **El mensaje de denegación es la parte que más importa.** Un «denegado» a secas deja al
  agente sin salida y reintenta lo mismo. El mensaje tiene que ofrecer la alternativa.
- **Atajo barato antes de leer.** Comparar el tamaño en bytes (`stat`) con un mínimo evita
  abrir y contar líneas de los archivos pequeños, que son casi todos.

## Si no se puede usar código

Sin el hook, la regla vuelve a ser prosa: una línea en el `CLAUDE.md` que diga «no leas
archivos de más de 500 líneas enteros; usa grep o un rango». Es mejor que nada y peor que
el hook, porque la cumple solo quien la lee.
