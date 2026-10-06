# Registro de trazabilidad

La **única** tabla que cruza las etapas de la cadena. Ubicación habitual:
`requerimientos/_registro.md`.

Se actualiza **en el mismo cambio** que crea o mueve cualquiera de los artefactos que lista.
No hay un paso de reconciliación posterior, porque los pasos que se dejan para después no se
hacen, y un registro desactualizado se consulta creyéndolo cierto.

## Plantilla

```markdown
# Registro de requerimientos — trazabilidad REQ → PRD → spec

Carpetas de este proyecto:
- Requerimientos: `requerimientos/`
- PRD: `prd/`
- Tareas: `tareas/`
- Specs: `docs/specs/`   <!-- o la ruta de cada área -->

Un `—` significa «todavía no existe». Un `n/a` significa «esa área no está impactada»: es
una afirmación, no un pendiente, y por eso puede contradecirse.

**Próximo número libre:** REQ-001

| REQ | Título | Estado | Validación | PRD | Tareas | Spec área A | Spec área B |
|---|---|---|---|---|---|---|---|
| | | | | — | — | — | — |
```

## Quién escribe cada celda

| Quién | Qué completa |
|---|---|
| Quien sube el REQ | La fila: número, título y estado `Recibido` |
| Quien valida | La columna Validación y el estado `Validado` |
| Quien escribe el PRD | La columna PRD y pasa el REQ a `En PRD` |
| El área que abre su spec | La celda de **su** área |
| Quien archiva la última spec pendiente | El estado `Entregado` |

Que varias personas escriban en la misma tabla es deliberado. Es lo que la hace neutral: no
pertenece a un lado de la cadena. A cambio, dos personas pueden coger el mismo «próximo
número libre» a la vez; el segundo cambio en integrarse choca y renumera. Es un conflicto
barato y visible, mucho mejor que un número duplicado que nadie nota.

## Qué es la fuente de verdad

El **estado** del REQ vive en su frontmatter, y la fila del registro lo refleja. Si
divergen, es un hallazgo: arréglalo en el mismo cambio, no lo dejes «para sincronizar luego».
Lo mismo con las áreas impactadas.

## Adaptar a carpetas existentes

Si el proyecto ya tiene sus carpetas (`docs/requisitos/`, `docs/prd/`…), no las renombres:

1. Rellena la sección «Carpetas de este proyecto» del registro con las rutas reales.
2. Ajusta los enlaces relativos de las plantillas al copiarlas.
3. Si el proyecto tiene un sistema de tickets, añade una columna «Ticket» con el enlace:
   complementa al REQ, no lo sustituye.

Si el proyecto tiene un solo área, borra las columnas de spec sobrantes y deja una.

## Comprobación a mano

Al cerrar un cambio que toque el registro:

1. Todo archivo `REQ-*` tiene fila, y toda fila tiene archivo.
2. Cada PRD, tarea o spec citada existe en el árbol.
3. Un área con `n/a` no tiene spec; un área impactada no tiene `n/a`.
4. El estado exige el artefacto que le corresponde: `En PRD` sin PRD es incoherente;
   `Entregado` con un área impactada sin spec también.
5. El REQ y el PRD se citan **en los dos sentidos**: la fila cita un PRD que declara ese REQ
   en su frontmatter, y viceversa.
6. El «próximo número libre» no coincide con ninguna fila existente.

Un validador podría automatizar estas seis comprobaciones, y de hecho el proyecto de origen
lo tiene. Esta librería no lo incluye todavía; hasta entonces, se revisan en cada cambio que
mueva un artefacto.

## Con el registro vacío

Un registro sin filas es válido y las seis comprobaciones pasan trivialmente. Es una
herramienta que se estrena con el primer REQ, no una que exige trabajo ya hecho. No
retro-documentes lo que entró antes de que el canal existiera: se rastrea por su propio
historial.
