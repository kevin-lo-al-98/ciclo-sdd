# Spec: llevar a este repositorio la arquitectura de documentación de un proyecto de referencia

Estado: **en curso** (fase 1). Basada en una lectura del proyecto de referencia el 2026-10-06 (`CLAUDE.md`,
`README`, el flujo requerimiento→spec, las ADRs 002 y 006, las plantillas, el hook, las
cabeceras de los validadores y la auditoría de cuellos de botella). Lo que no se leyó está
en [Fuera de alcance](#fuera-de-alcance).

## Objetivo

Que cualquier proyecto pueda adoptar, por niveles y sin imponer un stack, la arquitectura
de documentación que ese proyecto construyó para sus agentes: decisiones con registro de
cuándo consultarlas, contexto de sesión con presupuesto, y una cadena opcional de
requerimiento a spec. Lo que se publica es el **patrón**, no la instancia: nada del
dominio, de los clientes ni del estándar corporativo del proyecto de referencia.

## Contexto

El proyecto de referencia es un monorepo documental sin código de aplicación, consumido por agentes de
IA. Tiene cuatro piezas que resuelven problemas reales y generalizables:

1. `CLAUDE.md` con techo de bytes y criterio de qué gana su lugar, verificado por un script.
2. Un registro de decisiones donde cada entrada lleva `Trigger` («cuándo traerla») y
   `Scope`, de modo que el agente sabe qué ADR consultar ante una tarea.
3. Un hook que deniega la lectura entera de archivos pesados.
4. Una cadena `REQ → PRD → tarea → spec` con una sola tabla de trazabilidad.

Cuatro hallazgos condicionan el diseño:

- **La cadena (4) nunca se ha recorrido con trabajo real.** La auditoría del proyecto
  de referencia (2026-10-06) dice que los registros están vacíos y que no inventa tiempos. Se publica
  marcada como experimental.
- **Pesa.** Su propia auditoría cuenta al menos 6 MRs para una tarea de un solo área, con
  Producto firmando o revisando en las 9 etapas. La versión por defecto tiene que ser la
  ligera.
- **La [ADR 0000](../decisions/0000-usar-madr-para-registrar-decisiones.md) ya descartó ADR
  Zoom** y anticipó que el registro con `Trigger` sería «una decisión nueva». Se
  recoge en la [ADR 0005](../decisions/0005-registrar-cuando-traer-cada-decision-en-su-frontmatter.md).
- **Los scripts y los `references/` viajan distinto.** El servidor `mcp/` solo carga
  `references/` ([ADR 0004](../decisions/0004-servir-las-skills-por-mcp.md)): todo lo que
  deba llegar a un cliente MCP va ahí, y un script en otra carpeta no llega.

## Diseño

### Inventario del proyecto de referencia

| Pieza | Decisión | Por qué |
|---|---|---|
| Presupuesto de `CLAUDE.md` y criterio «qué gana su lugar» | Aprovechar | Es la filosofía de este repo, con una regla comprobable |
| Protocolo de contexto: índice → saltar al documento; Explore para barridos | Aprovechar | Genérico y barato |
| Hook `guard-lectura-pesada` | Adaptar | Genérico, pero es código (fase 3) |
| Registro con `Trigger`/`Scope`/`Enforcement` | Adaptar | Un nivel y sin copias del `Decision` ([ADR 0005](../decisions/0005-registrar-cuando-traer-cada-decision-en-su-frontmatter.md)) |
| Tabla «qué hacer cuando el pedido cambia» | Aprovechar | Lo más reutilizable del flujo |
| Tabla de precedencia entre fuentes | Adaptar | Plantilla que cada proyecto rellena |
| Trazabilidad en una tabla, actualizada en el mismo cambio | Aprovechar | Evita el paso de reconciliación que nadie hace |
| Plantillas REQ/PRD/tarea | Adaptar | Sin flags regulatorios ni áreas fijas; se conservan «Fuera de alcance» y «preguntas abiertas declaradas» |
| `rango: obliga \| informa` por documento | Adaptar, opcional | Útil pero secundario |
| Frontera Producto/IT, firma nominal, niveles de evidencia E1–E3 | Adaptar, opt-in | Política organizativa, no estructura |
| Validadores de enlaces e índice generado | Adaptar (fase 3) | Hoy atados a su lista de rutas y a su estándar de ADRs |
| ADR Zoom completo (14 propiedades, niveles L0–L3, espacios de nombres, copia verbatim del `Decision`, skills muy extensas) | Descartar | Ya rechazado en la ADR 0000 |
| Material de dominio (contexto, fuentes originales, PRDs) y skills de stack, de dominio o de marca | Descartar | Dominio, stack y material corporativo |
| `docs/migration`, planes de remediación, `ROADMAP.md` | Descartar | Historia del proyecto |
| Su servidor MCP | Descartar | Sirve contenido del proyecto; el `mcp/` de aquí sirve skills |

### Adopción por niveles

Cada nivel funciona sin los siguientes.

| Nivel | Qué da | Skill |
|---|---|---|
| 1 | Decisiones (MADR) y specs | `documentar-decisiones`, `adoptar-estructura-de-docs` (existen) |
| 2 | `CLAUDE.md` con presupuesto, índice y protocolo de lectura | `mantener-claude-md` (nueva) |
| 3 | Cadena requerimiento → PRD → tarea → spec. **Experimental** | `flujo-de-requerimientos` (nueva) |

### Estructura de archivos

```
skills/mantener-claude-md/
├── SKILL.md
└── references/
    ├── que-va-donde.md            criterio de qué gana su lugar y a dónde va lo demás
    ├── protocolo-de-contexto.md   índice → documento; cuándo delegar en Explore
    └── hook-lectura-pesada.md     el hook descrito y su configuración; sin script
skills/flujo-de-requerimientos/
├── SKILL.md
└── references/
    ├── flujo-y-duenos.md
    ├── cuando-cambia-el-pedido.md
    ├── precedencia-entre-fuentes.md
    ├── plantilla-requerimiento.md
    ├── plantilla-prd.md
    ├── plantilla-tarea.md
    ├── registro-de-trazabilidad.md
    ├── reporte-del-area.md        lo que el área reporta sobre una tarea, sin escribir en ella
    ├── variante-con-firmas.md     frontera Producto/IT, firma nominal y suplentes, opt-in
    └── cuellos-de-botella.md      dónde se atascó el diseño de origen y cómo auditar el propio
```

Las dos últimas referencias de `flujo-de-requerimientos` y los cambios de las demás vienen
de la [actualización del 2026-10-15](#actualización-del-2026-10-15).

Los ejemplos de estas referencias son ficticios. El `description` de cada skill enumera
sus disparadores y dice cuándo no aplica, para no competir con `documentar-decisiones`
(que cubre ADRs y specs; `flujo-de-requerimientos` cubre lo que está **antes** de la spec).

### Adopción en un proyecto externo

- **Desde cero:** `adoptar-estructura-de-docs` (nivel 1), luego `mantener-claude-md`
  (nivel 2), y el nivel 3 solo si hay una división entre quien pide y quien construye.
- **Con documentación previa:** `adoptar-estructura-de-docs` ya se detiene ante `.adrs/` o
  `docs/adr/` y no migra formatos. Se empieza por el nivel 2, que no toca sus ADRs. El
  nivel 3 exige mapear sus carpetas existentes a las de la cadena; `registro-de-trazabilidad.md`
  lo explica, porque el proyecto de referencia resuelve esto con una lista fija de rutas en un script.

### Hook y validadores

`hook-lectura-pesada.md` describe el comportamiento y la entrada de `settings.json`, pero
no lleva el script: ver la decisión abierta 2. La consecuencia es que en la fase 1 la
regla vuelve a ser prosa, que es lo que el hook original quería evitar.

## Decisiones abiertas

Las decisiones 1 a 3 se confirmaron el 2026-10-06 (las ADRs 0005 y 0006 pasaron a `accepted`).

1. **Idioma.** Las skills siguen en español ([ADR 0001](../decisions/0001-contenido-de-las-skills-en-espanol.md)
   intacta) y lo que generan usa el idioma del proyecto adoptante:
   [ADR 0006](../decisions/0006-generar-en-el-idioma-del-proyecto-adoptante.md). La
   traducción de la librería queda para una ADR futura.
2. **Código.** La fase 1 no lleva código. Hacer validadores y hook exige una ADR que
   sustituya o enmiende la [ADR 0003](../decisions/0003-solo-mcp-contiene-codigo.md); se
   decide al terminar la fase 2.
3. **Nivel 3.** Se incluye marcado como experimental, con el motivo escrito en el `SKILL.md`.
4. **Menciones al proyecto de referencia y a su estándar. Sin decidir.** La ADR 0000 los
   nombra, junto con un componente de su integración continua, en 5 líneas; `adoptar-estructura-de-docs` y
   `documentar-decisiones` citan «ADR Zoom» como ejemplo de formato propio. Además,
   `skills/skill-security-scan/SKILL.md` lleva `author: informa-db` en su metadato, pero es
   material vendorizado y no se toca. Antes de publicar hay que elegir entre dejar las
   menciones o neutralizarlas. Neutralizar la ADR 0000 exige una ADR que la sustituya,
   porque una ADR aceptada no se reescribe.

Además falta elegir **licencia**: la raíz no tiene `LICENSE`. Apache-2.0 evitaría mezclar
licencias con `skills/skill-security-scan/`, que ya la lleva.

## Fuera de alcance

- Escribir los validadores y el hook como código.
- Modificar skills existentes: la ampliación de `documentar-decisiones` (registro con
  `Trigger`) y de `adoptar-estructura-de-docs` (niveles) es la fase 2.
- Tocar ADRs aceptadas ni `skills/skill-security-scan/`.
- Traducir la librería.
- Evaluar las demás skills del proyecto de referencia, de las que solo se vio el nombre
  (unas diez).
- Añadir `LICENSE` y preparar el README para publicación.
- Un plugin de Claude Code para distribuirla.

## Pasos

1. Confirmar las ADRs 0005 y 0006 (pasan de `proposed` a `accepted`) y decidir la 4.
2. Escribir `mantener-claude-md` y sus tres referencias.
3. Escribir `flujo-de-requerimientos` y sus ocho referencias, con ejemplos ficticios.
4. Pasar la verificación de `CLAUDE.md` a las dos skills nuevas.
5. Fase 2, en otra pasada: ampliar las dos skills existentes.
6. Fase 3, condicional: ADR sobre código y, si se acepta, validadores en una carpeta aparte.

## Riesgos

- **Proceso sin validar.** Si el proyecto de referencia recorre sus primeros REQ y descubre que algún gate
  sobra, el nivel 3 publicado quedaría desfasado. Se nota cuando ese proyecto modifique
  su flujo; por eso va como experimental.
- **Índice de decisiones desactualizado.** Sin script, la tabla `Traer cuando` se mantiene
  a mano y deriva. Se nota cuando un ADR tiene `trigger` y no aparece en el índice.
- **Disparadores que compiten.** `flujo-de-requerimientos` y `documentar-decisiones`
  podrían cargarse ambas ante «escribe la spec». Se nota en el paso 3 de la verificación.

## Actualización del 2026-10-15

El riesgo «proceso sin validar» se materializó en parte: el proyecto de referencia modificó
su flujo entre el 6 y el 15 de octubre (al auditar sus cuellos de botella y escribir siete
decisiones nuevas) **sin haberlo recorrido todavía con un solo requerimiento**: sus registros
siguen vacíos. Se trajo a `flujo-de-requerimientos` lo que es patrón y no instancia:

- Etapas 8 y 9 separadas: producto valida la tarea, el área la cierra al archivar, producto
  cierra el REQ.
- La tarea la escribe solo producto; lo que reporta el área va en su spec y el avance se
  deriva (`reporte-del-area.md`), con aprobación de las áreas afectadas.
- Enmienda acotada del PRD con versión menor; reglas de re-firma de viabilidad tras un rebote.
- Lista cerrada de firmantes de producto con suplentes; firma única en `E1`.
- Hotfix: REQ de regularización en `Validado` como mínimo; plazo que bloquea solo el cambio
  que toca la tarea. Registro de tareas como índice.
- Un reference nuevo con los cuellos de botella y cómo auditar el flujo propio.

**No se trajo**, por ser instancia: el servidor MCP del proyecto y su identificación con
tokens (queda una nota genérica de «firma con identidad verificada»), la proyección a una
herramienta de gestión de tareas, los validadores y las skills de importación y de proyección.
**Tampoco la pausa de un REQ**, que el origen propuso pero no llegó a decidir: queda
descrita como propuesta en `cuellos-de-botella.md`.

Las skills de etapa del origen (alta, validación, viabilidad, PRD a tareas, prueba de usuario)
siguen sin evaluarse, como en el alcance inicial. Si se decide traerlas, es otra pasada con su
propia spec: tendrían que competir bien con `documentar-decisiones` y con esta skill.

## Criterio de terminado

Para la fase 1:

1. Cada skill nueva tiene `name` igual al nombre de su carpeta (kebab-case, ≤ 64
   caracteres, sin `--`), `description` ≤ 1024 caracteres y `SKILL.md` < 500 líneas:
   `wc -l skills/mantener-claude-md/SKILL.md skills/flujo-de-requerimientos/SKILL.md`.
2. Todo enlace relativo de las skills nuevas resuelve.
3. Con las skills instaladas, en una sesión nueva: «dame de alta un requerimiento» carga
   `flujo-de-requerimientos`; «mi CLAUDE.md es enorme, ¿qué recorto?» carga
   `mantener-claude-md`; y «escribe la spec de esto» carga `documentar-decisiones`, no
   `flujo-de-requerimientos`.
4. `grep -rniE "informa colombia|pacman|jenkins/common" skills/mantener-claude-md skills/flujo-de-requerimientos`
   no devuelve nada. No se busca «informa» a secas: es un verbo español y daría falsos positivos.
