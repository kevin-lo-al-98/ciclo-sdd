---
name: handoff
description: Comprime la conversación actual en un documento de traspaso para que otra sesión o agente la retome. Úsala cuando el usuario pida "/handoff", "deja un traspaso", "arma un handoff para la próxima sesión", o cuando una conversación larga se vaya a cortar y haya trabajo pendiente que otra sesión deba continuar sin perder contexto.
argument-hint: Para qué se va a usar la próxima sesión
---

Tu ÚNICO trabajo es escribir el documento de traspaso. NO hagas, empieces ni avances
parcialmente el trabajo que se está traspasando — la idea es gastar tokens en el traspaso, no
en la tarea, para que continúe en una sesión nueva. Todo lo que venga *después* de invocar
esta skill —o, sin una invocación explícita, el trabajo descrito como "siguiente" / "para
después"— es material para capturar en el documento, no trabajo para hacer ahora. (El
trabajo pedido explícitamente *antes* del traspaso sí es válido hacerlo primero.)

Escribí el documento para que un agente nuevo pueda continuar el trabajo:

- Capturá el flujo de trabajo que se estableció durante la conversación (p. ej.
  compilar-y-smoke-test, TDD rojo-verde-refactor, editar-lint-commit) para que el próximo
  agente continúe con el mismo proceso en vez de inventar uno propio.
- Incluí las decisiones clave y su razonamiento — especialmente los enfoques rechazados y
  por qué fallaron — para que el próximo agente no vuelva a explorar callejones sin salida.
- Fijá el directorio de trabajo, la rama de git y el último commit significativo.
- No dupliques contenido que ya está en otros artefactos (PRDs, planes, ADRs, issues,
  commits, diffs). Referencialos por ruta o URL.
- Redactá cualquier información sensible (claves de API, contraseñas, datos personales).
- Si el usuario pasó argumentos, tratalos como el foco de la próxima sesión y ajustá el
  documento en consecuencia.

Estructurá el documento con estas secciones: Estado (hecho / en curso / bloqueado),
Decisiones, Flujo de trabajo, Próximos pasos, Skills sugeridas (las que el próximo agente
debería invocar), Referencias.

## Dónde guardarlo

Guardalo en una subcarpeta `handoffs/` del directorio temporal del sistema operativo —
creala si no existe. No uses el scratchpad de la sesión (su ruta, larga y específica de la
sesión, es difícil de limpiar después).

- Windows: `%TEMP%\handoffs\HANDOFF-<slug>.md`
- macOS/Linux: `$TMPDIR/handoffs/HANDOFF-<slug>.md` (si no existe, `/tmp/handoffs/`)

Después reportá la ruta guardada en una forma **usable de forma independiente**: una ruta
absoluta completa, o una anclada a una variable de entorno (p. ej.
`%TEMP%\handoffs\HANDOFF-foo.md`). Nunca la abrevies con puntos suspensivos ni devuelvas un
fragmento específico de la sesión que el usuario no pueda copiar y usar.
