# Roadmap

> Índice vivo del trabajo. Ver los cambios SDD y PRDs enlazados para el detalle.

## En curso

<!-- Cambios SDD activos. Se listan solo para bloquear tareas Pendientes dependientes.
     Quitar la entrada cuando su cambio SDD se archive. -->

### agregar-login-usuarios
- **Estado**: spec lista, implementación en curso (3/8 tareas completas)
- **SDD**: `openspec/changes/agregar-login-usuarios/`
- **Bloquea**: `agregar-permisos-por-rol`, `agregar-log-de-auditoria`

### refactor-alta-de-pedidos
- **Estado**: fase de diseño, a la espera de revisión de arquitectura
- **SDD**: `openspec/changes/refactor-alta-de-pedidos/`
- **Bloquea**: `importacion-masiva-de-pedidos`

## Pendiente

<!-- Ordenada. El primer ítem TIENE que ser arrancable (sin dependencia sin cumplir).
     Usar una lista numerada para que el orden sea explícito. -->

### 1. arreglar-query-lenta-de-login
- **Tipo**: no-SDD
- **Depende de**: —
- **Próximo paso**: perfilar la consulta `usuarios.buscarPorEmail` en los logs de
  producción y agregar el índice que falta.
- **Notas**: lo marcó el equipo de infraestructura en la revisión de performance de la
  semana pasada. Bajo riesgo, sin migración de esquema.

### 2. agregar-permisos-por-rol
- **Tipo**: SDD
- **PRD**: `docs/prds/agregar-permisos-por-rol.md`
- **Depende de**: `agregar-login-usuarios`
- **Próximo paso**: una vez que `agregar-login-usuarios` se archive, correr
  `/sdd-new agregar-permisos-por-rol`.
- **Notas**: control de acceso basado en roles sobre la nueva capa de autenticación.

### 3. importacion-masiva-de-pedidos
- **Tipo**: SDD
- **PRD**: `docs/prds/importacion-masiva-de-pedidos.md`
- **Depende de**: `refactor-alta-de-pedidos`
- **Próximo paso**: una vez que `refactor-alta-de-pedidos` se archive, correr
  `/sdd-new importacion-masiva-de-pedidos`.

### 4. agregar-log-de-auditoria
- **Tipo**: SDD
- **Depende de**: `agregar-login-usuarios`
- **Próximo paso**: redactar un PRD vía `flujo-de-requerimientos`, después correr
  `/sdd-new agregar-log-de-auditoria`.
- **Notas**: todavía no hay PRD — el alcance es difuso más allá de "guardar quién hizo qué
  y cuándo".

## Futuro

<!-- Ideas capturadas para después. Sin PRD ni definición formal todavía.
     Promover a Pendiente cuando estén listas para especificarse. -->

- **Aislación de esquema multi-tenant** — separar cada organización en su propio esquema
  de base de datos para reducir el radio de impacto de un incidente de fuga de datos.
  Nombre SDD sugerido: `agregar-esquemas-multi-tenant`
- **Webhooks para eventos de auditoría** — que sistemas externos puedan suscribirse a las
  entradas del log de auditoría.
  Nombre SDD sugerido: `agregar-webhooks-de-auditoria`
- **Gateway GraphQL** — exploratorio; el resto de la organización se está moviendo hacia
  ahí pero todavía no se decidió.
- **Búsqueda v2 (OpenSearch)** — reemplazar la búsqueda full-text actual de Postgres cuando
  deje de escalar. Sin fecha.
