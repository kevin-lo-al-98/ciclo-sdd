# Plantilla de tarea

Ubicación: `tareas/TAREA-NNN-<slug>.md` (o la carpeta que el proyecto ya use). Una tarea es
la **unidad de entrega** derivada de una capacidad de un PRD `Final`: un resultado
**vertical y observable**, no una capa. Solo se usa en la versión completa y en la de firmas.

**No es** el desglose técnico de ingeniería (el `tasks.md` de una spec): la tarea lleva
criterios de negocio observables y niveles de prueba; el desglose técnico es de cada área.

Presupuesto: **≤ 250 líneas**. Si la tarea no cabe, no es una entrega, son varias: divídela.
Un resultado que necesita 600 líneas para explicarse suele esconder tres entregas distintas.

```markdown
---
tipo: tarea
id: TAREA-NNN
titulo: Enunciado del resultado observable en una línea
estado: Borrador        # Borrador → Lista → Validada | Descartada. «Entregada» no se escribe: se deriva
nivel-evidencia: E2     # E1 | E2 | E3  (ver variante-con-firmas.md)
origen: prd             # prd | hotfix
prd: PRD-NNN
prd-secciones: []       # ej. ["§5.1", "§11.2"]; qué secciones del PRD baja esta tarea
requerimientos: []      # ej. [REQ-NNN]
areas-impactadas: []    # salen del reparto del PRD, dentro de las del REQ
validacion:             # la escribe quien valida; ver «Cómo se prueba»
  estado: pendiente     # pendiente | aprobada | aprobada-con-excepciones | rechazada
  firmada-por:          # variante con firmas: nombre propio
  fecha:
  motivo:               # obligatorio si es aprobada-con-excepciones
  plazo:                # plazo de regularización de la excepción
fecha-alta: AAAA-MM-DD
fecha-lista:
fecha-validada:
# El avance, el enlace a la spec, el responsable y las firmas del área NO van aquí: van en
# el archivo de reporte del cambio de cada área (reporte-del-area.md).
---

# TAREA-NNN — {mismo título del frontmatter}

## 1. Problema y resultado esperado

<!-- Qué necesidad resuelve esta entrega concreta y qué comportamiento observable
     queda disponible para el usuario final. Un resultado vertical, no por capas. -->

## 2. Alcance

<!-- Qué entra en esta unidad de entrega. Lista concreta de capacidades. -->

## 3. Fuera de alcance

<!-- Lo que queda para otras tareas, aunque pertenezca al mismo PRD. -->

## 4. Criterios de aceptación de negocio

<!-- Numerados y observables. Cada criterio cita la sección del PRD de la que sale. -->

| # | Criterio de negocio | Sección de origen en el PRD |
|---|---|---|
| CA-1 | | PRD-NNN §5.1 |

## 5. Nivel de evidencia

<!-- E1, E2 o E3. Si propones E1 para algo que parece comportamiento observable, o bajas
     de E3 a E2, justifica el motivo por escrito aquí. -->

- **Nivel**:
- **Justificación**:

## 6. Cómo se prueba

<!-- OBLIGATORIA. Contiene la doble prueba: la de código y la de usuario. -->

### 6.1 Pruebas de código (automatizadas)
-

### 6.2 Pruebas de usuario (funcionales)
<!-- Obligatorias para E2 y E3. Acción del usuario → resultado observable esperado. -->
1. **Paso 1**: acción → resultado esperado.

## 7. Dependencias

<!-- Tareas previas necesarias o dependencias externas que bloquean. -->
- Ninguna.

## 8. Preguntas abiertas

<!-- Huecos que el PRD no resolvió para esta entrega y que hay que cerrar con producto. -->
- Ninguna.

## 9. Validación

- **Veredicto**: pendiente   <!-- aprobada | aprobada-con-excepciones | rechazada -->
- **Evidencia recopilada**:

## 10. Historial

| Fecha | Quién | Qué cambió |
|---|---|---|
| AAAA-MM-DD | | Alta inicial |
```

## Un solo dueño del archivo

La tarea la escribe **solo quien posee el producto**. El área que construye no tiene campos
en ella: su avance, su responsable y su cierre se **derivan** del archivo de reporte de su
spec ([`reporte-del-area.md`](reporte-del-area.md)). Una versión anterior de este diseño daba
al área un campo `avance` dentro de la tarea, «para no partir el dueño»; en la práctica
cada actualización era un cambio aparte en un archivo ajeno, y por eso se movió.

Ningún estado lo escribe el área. `Borrador`, `Lista` y `Descartada` los pone quien posee la
tarea, `Validada` la deja su prueba de usuario, y `Entregada` **no existe como valor
escrito**: es lo que resulta de estar validada y de que cada área haya cerrado su cambio.

## Si la validación rechaza la tarea

La tarea se queda en `Lista`, la causa se anota en el historial y `validacion.estado` pasa a
`rechazada`. El área **reabre su cambio y retira su firma de construcción**; con eso su avance
vuelve a `en curso` sin que nadie lo edite. Si el rechazo muestra que el comportamiento pedido
no encaja con la capacidad descrita, se enmienda el PRD (versión menor si es acotada, mayor si
no: ver [`cuando-cambia-el-pedido.md`](cuando-cambia-el-pedido.md)) y se vuelven a destilar las
tareas afectadas.

## Vía rápida para urgencias

Una tarea con `origen: hotfix` puede nacer ya en `Lista`, sin REQ ni PRD previos; su avance
sale del cambio del área, como el de cualquier otra. A cambio tiene un **plazo máximo** (el
proyecto de origen usaba 5 días hábiles) para que alguien escriba el REQ de regularización, y
**no queda entregada sin citarlo**. Sin plazo, la vía rápida se convierte en la vía normal.

Dos precisiones que el origen tuvo que añadir tras revisarlo:

- **El REQ de regularización es un REQ nuevo** que describe el hotfix y cita, como referencia,
  un REQ existente (campo propio en el frontmatter: `req-referencia`). Tiene que estar como
  mínimo en `Validado`: exigir un PRD en cinco días es irreal para un hotfix, pero `Validado`
  prueba que alguien con autoridad entendió qué se cambió. Con solo exigir «cualquier fila»,
  bastaba un `Borrador`.
- **El plazo vencido no debe bloquear a todo el repositorio.** Si lo comprueba un validador
  que corre en cada cambio, al día seis **todos los cambios fallan**, también los que no
  tocan esa tarea, sin que nadie haya cambiado nada; y quien sufre el bloqueo no puede
  arreglarlo, porque el REQ lo escribe otro lado. El plazo vencido bloquea solo el cambio que
  toca esa tarea; para el resto es un aviso.
