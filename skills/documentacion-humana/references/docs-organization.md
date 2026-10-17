# Guías de organización de la documentación

## Propósito

Define los requisitos de estructura para la carpeta `/docs`, las especificaciones de los
archivos núcleo, y los patrones de documentación tanto para librerías como para
aplicaciones. Busca una estructura de documentación completa y navegable.

## Archivos núcleo requeridos

Todo proyecto tiene que incluir estos archivos en `/docs`:

### overview.md (requerido)
**Para librerías**: arquitectura de la API pública, patrones de diseño que afectan el uso,
conceptos clave para quien consume la librería.
**Para aplicaciones**: arquitectura detallada, relaciones entre componentes, decisiones
técnicas.

### quick-start.md (requerido)
**Para librerías**: ejemplos completos para el consumidor, escenarios de integración,
resolución de problemas.
**Para aplicaciones**: ejemplos de uso, escenarios de despliegue, guías de configuración.

### integration.md (requerido solo para librerías)
- Instrucciones de integración detalladas para distintos entornos.
- Gestión de dependencias para las herramientas de build soportadas.
- Matriz de compatibilidad de versiones.
- Configuración específica por framework.

## Patrones de organización de la documentación

### Estructura por feature
- `{nombre-de-la-feature}.md` — documentación de una feature individual.
- Enfocada en **cómo usar** la feature, no en su implementación.
- Incluye patrones de uso y opciones de configuración.
- Referencias cruzadas a features relacionadas.

### Agrupación lógica
- **Conceptos relacionados** agrupados entre sí.
- **Complejidad progresiva** de lo básico a lo avanzado.
- **Patrones de nombrado consistentes** entre archivos.

### Separación consumidor vs implementación

#### Orientado al consumidor (primario)
- `core-concepts.md` — conceptos fundamentales desde la perspectiva del usuario.
- `configuration.md` — opciones de configuración para el usuario.
- `api-reference.md` — documentación de la API pública.
- `advanced-usage.md` — escenarios complejos para quien consume la librería.

#### Documentación de implementación (secundario)
- Se mantiene en secciones separadas: `internal/`, `development/`, `contributing/`.
- Arquitectura interna y decisiones de diseño.
- Configuración de desarrollo y guías de contribución.
- APIs internas y puntos de extensión.

## Estructura de localización

### Soporte multi-idioma
- **Principal**: carpeta `/docs` (en el idioma por defecto del proyecto).
- **Adicional**: carpetas `/docs/{código-de-idioma}` (p. ej. `/docs/en`, `/docs/fr`).
- **Replicación completa** de la estructura en cada idioma.
- **Mismos nombres de archivo** en todas las versiones de idioma.

## Soporte de navegación

### Referencias cruzadas
- **Usar enlaces relativos** entre archivos de documentación.
- **Enlazar a secciones específicas** con anclas.
- **Referenciar documentación externa** con URLs completas.
- **Mantener la precisión** durante reorganizaciones.

### Páginas de índice
- **Tabla de contenidos clara** para conjuntos grandes de documentación.
- **Estructura de contenido amigable para la búsqueda**.
- **Progresión lógica de temas**.

## Guías específicas para librerías

### Prioridad en el enfoque de consumidor
- **Empezá con ejemplos de uso** antes de explicar conceptos.
- **Enfocate en las APIs públicas** y evitá detalles de implementación.
- **Mostrá escenarios de integración realistas**.
- **Priorizá los casos de uso comunes** sobre los casos límite.
- **Dejá resolución de problemas** para cuestiones de integración.

### Rendimiento y seguridad
- **Consideraciones de rendimiento** desde la perspectiva del usuario.
- **Aspectos de seguridad** aplicables al uso de la librería.
- **Puntos de extensión** disponibles para quien la consume.
- **Opciones de personalización** para el usuario.

## Buenas prácticas de organización de archivos

### Estructura modular
- **Responsabilidad única** por archivo de documentación.
- **Actualizaciones fáciles** gracias a contenido enfocado.
- **Formato consistente** para procesamiento automatizado.

### Consideraciones de mantenimiento
- **Revisión y actualización regular**.
- **Alineación de versión** con los cambios de código.
- **Integración de feedback** de usuarios.

## Ejemplos

### Plantilla de documentación de feature
```markdown
# Nombre de la feature

## Propósito
Descripción breve de qué hace esta feature y cuándo usarla.

## Uso básico
Ejemplo simple que muestra la funcionalidad central.

## Configuración
Opciones de configuración disponibles, con ejemplos.

## Escenarios avanzados
Casos de uso y patrones complejos.

## Resolución de problemas
Problemas comunes y sus soluciones.

## Features relacionadas
Referencias cruzadas a documentación relacionada.
```

### Documentación de API orientada al consumidor
```markdown
# Referencia de API

## Clases centrales

### MiLibreria
Punto de entrada principal de la funcionalidad de la librería.

#### Métodos
- `procesar(String entrada)` — procesa los datos de entrada y devuelve el resultado.
- `configurar(Config config)` — define las opciones de configuración.

#### Ejemplos de uso
```java
MiLibreria lib = new MiLibreria();
lib.configurar(Config.builder().timeout(5000).build());
String resultado = lib.procesar("datos");
```

#### Manejo de errores
```java
try {
    String resultado = lib.procesar("datos");
} catch (ProcessingException e) {
    // manejar errores de procesamiento
}
```
```
