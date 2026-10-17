# Spec: piloto de `flujo-de-requerimientos` con trabajo real

Estado: **propuesta**, sin empezar. Se abrió el 2026-10-16.

## Objetivo

Recorrer la cadena `REQ → (PRD → TAREA →) spec → código` con trabajo real, para
confirmar o recortar cada regla de la skill y decidir si se le quita la marca
**EXPERIMENTAL**. Hoy el diseño es una hipótesis razonada: el proyecto de origen lo
auditó en papel, pero sus registros estaban vacíos (ver el aviso al principio de
[`skills/flujo-de-requerimientos/SKILL.md`](../../skills/flujo-de-requerimientos/SKILL.md)).

## Condiciones del proyecto piloto

- **Al menos dos personas**, una que pide y otra que construye. Con una sola persona, la
  skill no aplica y el piloto no mide nada.
- Usa ciclo-sdd como plugin o como copia por proyecto, con la sección «Ciclo de vida:
  roles» en modo `pareja` o `equipo`
  ([ADR 0011](../decisions/0011-roles-y-dueno-en-el-ciclo-sdd.md)).
- Arranca en tamaño **Ligera** (REQ + registro + spec). Se sube a Completa solo cuando se
  pierda algo concreto que el PRD o la tarea habrían evitado, que es la regla de la
  propia skill.

## Qué se mide

Por cada REQ, en una tabla al final de esta spec:

| Medida | Cómo | Para qué |
|---|---|---|
| Tiempo por etapa | Fecha de cada cambio de estado en el frontmatter del REQ | Encontrar el cuello de botella real |
| Cambios por tarea | Commits o MR que tocan los artefactos de una tarea | El origen contó ocho en serie; comprobar si el rediseño los baja |
| Criterios perdidos en el traspaso | Criterios del REQ o PRD que no aparecen en la spec ni como hueco declarado | Es el fallo que la cadena dice evitar |
| Etapas o campos sin usar | Secciones de plantilla vacías o con «N/A» | Candidatos a recortar |
| Choques en el registro | Conflictos de merge en la tabla de trazabilidad o en el «próximo número libre» | Comprobar si la contención compartida sigue siendo un problema |

El método de auditoría es el de
[`references/cuellos-de-botella.md`](../../skills/flujo-de-requerimientos/references/cuellos-de-botella.md).

## Criterio de terminado

Se quita la marca EXPERIMENTAL cuando se cumplen **las tres**:

1. Al menos **3 REQ recorridos hasta `Entregado`**, con al menos uno que haya pasado por
   un cambio de pedido (`references/cuando-cambia-el-pedido.md`).
2. Cada regla de la sección «Las reglas que sostienen la cadena» está **confirmada o
   recortada**, con el REQ que lo justifica.
3. Los hallazgos están cerrados en la skill y en sus referencias con
   `cerrar-plan-o-spec-con-regla-de-oro`, y la versión del plugin sube con su entrada en
   `CHANGELOG.md`.

Si después de 3 REQ el coste supera lo que protege, el resultado válido también puede ser
recortar la skill a solo el tamaño Ligera.

## Fuera de alcance

Construir un validador automático del registro, integrar con Jira o GitHub Issues, y la
variante con firmas, salvo que el proyecto piloto la necesite de verdad.

## Registro del piloto

| REQ | Tamaño | Fechas por etapa | Cambios por tarea | Criterios perdidos | Notas |
|---|---|---|---|---|---|
| — | — | — | — | — | Sin empezar |
