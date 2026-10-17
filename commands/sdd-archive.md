---
description: Funde la delta de la spec en openspec/specs/<capability>/ y mueve el cambio a archive/AAAA-MM-DD-<nombre>/. Bloquea si el veredicto es FAIL.
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
2. **Fundí la delta** de `spec.md` en `openspec/specs/<capability>/spec.md`, que es la
   verdad consolidada de la capability. Un bloque modificado se reemplaza **entero**, nunca
   con un parche parcial. Si la capability es nueva, creá su carpeta con un `README.md`.
3. Escribí `archive-report.md` y mové los artefactos a
   `openspec/changes/archive/AAAA-MM-DD-<nombre>/`. El informe cierra **siempre** con una
   sección `## Aprendizaje`: qué sabemos ahora que no sabíamos al abrir el cambio y que le
   sirve a quien abra el siguiente — lo que la spec dio por sentado y no era, el desvío que
   hubo que asentar, la trampa que costó horas. No es un resumen de lo hecho (eso es el
   resto del informe) ni una autocrítica. Si de verdad no hubo nada, se escribe
   `Sin aprendizaje registrado` y se sigue: la sección va igual, porque la que se omite "por
   esta vez" no vuelve.
4. **`archive/` es inmutable**: nunca modifiques nada que ya esté ahí.
5. **Superado ≠ implementado.** Si el cambio se archiva porque su evidencia quedó
   desactualizada y **no** se funde en `specs/`, va como
   `AAAA-MM-DD-<nombre>-<sufijo>/` con un `archive-report.md` que declara
   `estado: Superado` y `superado-por`, explicitando que no se fundió. El nombre corto en
   `changes/<nombre>/` es siempre lo vigente.
6. Si el cambio agregó o cambió algo que el `CLAUDE.md` o el README del proyecto documenta
   (arquitectura, convenciones, deuda conocida), actualizalo en el mismo cierre.
7. Si el proyecto rastrea este cambio en un backlog externo, señalá que corresponde cerrarlo
   ahí también — no lo toques vos mismo salvo que te lo pidan.
