# Plantilla de PRD

Ubicación: `prd/PRD-NNN-<slug>.md` (o la carpeta que el proyecto ya use). Un PRD
(*Product Requirements Document*) traduce uno o más REQ en la **definición del
comportamiento del producto**: pantallas, reglas, estados, catálogos, terminología y
criterios de aceptación. Es el insumo del que cada área saca su spec.

Las secciones que no apliquen se **eliminan**, no se dejan vacías ni con «N/A»: una sección
vacía hace que el lector siga buscando. Los comentarios `<!-- … -->` se borran al escribir.

Un PRD `Final` **no se edita en el sitio** salvo por una enmienda acotada (versión menor, con
su fila en el historial); cualquier otro cambio de comportamiento es una versión nueva en un
archivo nuevo (ver [cuando-cambia-el-pedido.md](cuando-cambia-el-pedido.md)).

```markdown
---
tipo: prd
id: PRD-NNN
titulo: Qué comportamiento define este PRD
version: 1.0              # X.Y: la menor sube con una enmienda acotada; la mayor, con un archivo nuevo
estado: Borrador          # Borrador → Final → Superado (por una versión mayor posterior)
autor: nombre-de-quien-lo-escribe
fecha: AAAA-MM-DD
requerimientos: [REQ-NNN]
areas-impactadas: []
---

# PRD-NNN — {mismo título del frontmatter}

## 1. Resumen ejecutivo

<!-- Cinco a diez líneas. Qué problema resuelve, para quién y qué cambia el día que
     esté entregado. Se lee solo, sin el resto del documento. -->

## 2. Requerimientos de origen

<!-- Los REQ que este PRD destila, con su enunciado en una línea. Si un REQ entró
     parcialmente, di qué parte quedó fuera y por qué. -->

| REQ | Problema | Cobertura en este PRD |
|---|---|---|
| REQ-NNN | | Total / Parcial (qué falta) |

## 3. Objetivos y no objetivos

### 3.1 Objetivos
### 3.2 No objetivos

<!-- El espejo del «fuera de alcance» del REQ, ya en términos de producto. -->

## 4. Público objetivo y roles

<!-- Los roles que tocan esto y qué puede hacer cada uno. Las diferencias de permiso
     van aquí: son regla de negocio, no detalle de implementación. -->

## 5. Diseño de la solución

### 5.1 Flujo principal
### 5.2 Flujos alternativos y de error
### 5.3 Pantallas involucradas

<!-- Por pantalla: qué muestra, qué permite hacer y su referencia al diseño vigente.
     El diseño ilustra la composición; este documento fija el comportamiento. -->

## 6. Catálogos

<!-- Los valores cerrados que el producto necesita: estados, tipos, niveles, grupos.
     Enumerados COMPLETOS, con el nombre que verá el usuario. Un catálogo a medias
     obliga a cada área a inventar el resto por su lado, y terminan distintos. -->

## 7. Modelo de datos

<!-- Las entidades y sus campos en términos de negocio: qué significa cada uno, si es
     obligatorio y de qué fuente sale. NO es el esquema de base de datos ni los
     tipos del código: eso lo deciden las áreas en su spec. -->

## 8. Reglas de cálculo

<!-- Toda regla determinista que el producto aplica, escrita para poder verificarse:
     entradas, salida y el caso borde. Si la fórmula es sensible, no se pega: se
     referencia la fuente autorizada. -->

## 9. Terminología

<!-- Los términos que el producto usa de cara al usuario, con su definición. Si este
     PRD introduce un término nuevo o renombra uno existente, dilo de forma
     EXPLÍCITA: obliga a actualizar el glosario y los textos de la interfaz. -->

## 10. Reparto entre áreas

<!-- Qué le toca a cada área. Es la sección que decide cuántas specs salen de este PRD
     y evita que dos áreas implementen lo mismo o que ninguna implemente el pegamento.
     Se omite si solo hay un área. -->

| Capacidad | Área A | Área B |
|---|---|---|
| | | |

## 11. Criterios de aceptación

<!-- Numerados y observables. Cada uno tiene que poder cerrarse con un sí o un no. Son
     el puente a los escenarios de las specs: cada área los traduce sin quitar ninguno.

     Trazabilidad hacia atrás: cada criterio del REQ de origen aparece aquí, o está
     declarado como hueco en la sección 2. -->

| # | Criterio | REQ de origen |
|---|---|---|
| AC-1 | | CA-1 |

## 12. Datos sensibles y normativa

<!-- Si este PRD toca datos personales, autenticación, autorización o una obligación
     normativa: dilo aquí y cita el marco que aplica. Puede exigir revisión humana
     obligatoria antes de pasar a `Final`. Se omite si no aplica. -->

## 13. Historial

<!-- Una fila por versión. Una enmienda acotada nombra aquí, por número, TODAS las
     secciones que modifica: es lo que permite calcular qué tareas y specs afecta.
     Esta sección no se omite aunque el PRD sea nuevo. -->

| Versión | Fecha | Quién firma | Qué cambió | REQ que lo motiva | Revisión |
|---|---|---|---|---|---|
| 1.0 | AAAA-MM-DD | | Primera versión | REQ-NNN | |
```

## Antes de pasar a `Final`

Una persona revisa el PRD y deja su veredicto por escrito. Qué mirar:

1. Cada criterio de cada REQ de origen aparece en la sección 11 o está declarado como hueco
   en la 2.
2. Ninguna sección prescribe implementación (si lo hace, esa parte no obliga; pásala a un ADR).
3. Los catálogos de la sección 6 están completos.
4. El reparto de la sección 10 deja claro quién implementa el contrato compartido.
