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
estado: Borrador        # DE PRODUCTO: Borrador → Lista → Validada → Entregada | Descartada
avance: pendiente       # DEL ÁREA:    pendiente → en curso → construido
nivel-evidencia: E2     # E1 | E2 | E3  (ver variante-con-firmas.md)
origen: prd             # prd | hotfix
prd: PRD-NNN
prd-secciones: []       # ej. ["§5.1", "§11.2"]
requerimientos: []      # ej. [REQ-NNN]
areas-impactadas: []
specs: {}               # área → nombre del cambio de spec, o n/a
fecha-alta: AAAA-MM-DD
fecha-entregada:
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

## Dos campos de estado, cada uno con un solo dueño

`estado` es de **producto** y `avance` es del **área que construye**. Son campos separados a
propósito: el área no cambia el estado ni los criterios de aceptación, y producto no toca el
avance. Un solo campo que ambos editan se pisa, y nadie sabe quién tuvo la última palabra.

## Si la validación rechaza la tarea

El `avance` vuelve a `en curso` (es campo del área), el motivo se anota en el historial y el
`estado` de producto no cambia. Si el rechazo muestra que el comportamiento pedido no encaja
con la capacidad descrita, se enmienda el PRD con una versión nueva y se vuelven a destilar
las tareas.

## Vía rápida para urgencias

Una tarea con `origen: hotfix` puede nacer ya en `Lista` y `en curso`, sin REQ ni PRD
previos. A cambio tiene un **plazo máximo** (el proyecto de origen usaba 5 días hábiles)
para que alguien escriba el REQ de regularización, y **no puede pasar a `Entregada` sin
citarlo**. Sin plazo, la vía rápida se convierte en la vía normal.
