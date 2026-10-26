---
description: Funde la delta de la spec en openspec/specs/<capability>/ y mueve el cambio a archive/AAAA-MM-DD-<nombre>/. Bloquea si el veredicto es FAIL o si producto todavía no validó la tarea de origen.
argument-hint: nombre del cambio
---

Cerrar un cambio SDD: fundir su delta y archivarlo.

Argumento: `$ARGUMENTS` = nombre del cambio.

## Roles

Si el `CLAUDE.md` del proyecto tiene la sección «Ciclo de vida: roles» con modo `pareja` o
`equipo`, archiva el `dueño` de `proposal.md`, que es quien mejor sabe qué cambió al fundir
la delta. Si ejecuta otra persona, avisá y pedí confirmación antes de mover nada, y anotá
en `archive-report.md` quién archivó. Sin esa sección, el modo es `solo` y esto no aplica.

## Instrucciones

1. **No hay `archive` sin `verify` en PASS.** Requiere `verify-report.md` con veredicto
   `PASS` o `PASS WITH WARNINGS`. Si es `FAIL` → **PARÁ**, no archives bajo ninguna
   circunstancia.
2. **Con origen de tipo `tarea`, no hay `archive` sin prueba de usuario.** Si `proposal.md`
   declara `tarea`, leé `validacion.estado` de esa tarea: si no es `aprobada` ni
   `aprobada-con-excepciones`, **pará** y decí que falta que Producto la pruebe. No es un
   `FAIL`: el cambio está bien, solo todavía no le toca. Archivar es lo que cierra la
   tarea, y no se cierra lo que nadie probó como usuario.
3. **Fundí la delta** de `spec.md` en `openspec/specs/<capability>/spec.md`, que es la
   verdad consolidada de la capability. Un bloque modificado se reemplaza **entero**, nunca
   con un parche parcial. Si la capability es nueva, creá su carpeta con un `README.md`.
4. Escribí `archive-report.md` y mové los artefactos a
   `openspec/changes/archive/AAAA-MM-DD-<nombre>/`. El informe cierra **siempre** con una
   sección `## Aprendizaje`: qué sabemos ahora que no sabíamos al abrir el cambio y que le
   sirve a quien abra el siguiente — lo que la spec dio por sentado y no era, el desvío que
   hubo que asentar, la trampa que costó horas. No es un resumen de lo hecho (eso es el
   resto del informe) ni una autocrítica. Si de verdad no hubo nada, se escribe
   `Sin aprendizaje registrado` y se sigue: la sección va igual, porque la que se omite "por
   esta vez" no vuelve.
5. **Cierre en el registro (con origen).** Con `tarea`: si con este cambio quedan
   archivados los de todas las `areas-impactadas` de la tarea, mové su fila a «entregadas»
   en el registro de tareas. Si las otras áreas trabajan en otro repositorio y no podés
   comprobarlo, preguntá. No escribas `Entregada` en la tarea: se deriva. Con
   `requerimiento` (tamaño Ligera): si era la última spec del REQ, pasalo a `Entregado` en
   su frontmatter y en el registro; la skill se lo asigna a quien archiva la última spec, y
   es la única escritura de este comando en un archivo de Producto.
6. **`archive/` es inmutable**: nunca modifiques nada que ya esté ahí.
7. **Superado ≠ implementado.** Si el cambio se archiva porque su evidencia quedó
   desactualizada y **no** se funde en `specs/`, va como
   `AAAA-MM-DD-<nombre>-<sufijo>/` con un `archive-report.md` que declara
   `estado: Superado` y `superado-por`, explicitando que no se fundió. El nombre corto en
   `changes/<nombre>/` es siempre lo vigente. Un cambio superado no entregó nada: no
   exige la prueba de usuario del paso 2 ni cierra nada en el registro.
8. Si el cambio agregó o cambió algo que el `CLAUDE.md` o el README del proyecto documenta
   (arquitectura, convenciones, deuda conocida), actualizalo en el mismo cierre.
9. Si el proyecto rastrea este cambio en un backlog externo, señalá que corresponde cerrarlo
   ahí también — no lo toques vos mismo salvo que te lo pidan.
