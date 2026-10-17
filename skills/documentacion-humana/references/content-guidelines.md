# Guías de contenido

## Propósito

Define estándares de escritura, requisitos de formato y criterios de calidad para toda la
documentación humana. Busca una documentación consistente, clara y mantenible en todos los
proyectos.

## Requisitos de estilo de escritura

### Estándares de lenguaje
- Lenguaje **claro y conciso**.
- Encabezados y descripciones **orientados a la acción**.
- **Terminología consistente** en toda la documentación.
- **Voz activa**, preferida sobre la voz pasiva.
- **Tiempo presente** para la funcionalidad actual.

### Estructura de contenido
- **Revelación progresiva**: conceptos básicos antes de los avanzados.
- **Orientado al usuario**: lo que el usuario necesita saber, no los detalles internos.
- **Formato escaneable**: encabezados, viñetas, párrafos cortos.
- **Flujo lógico**: cada sección se construye sobre la anterior.

## Estándares de ejemplos de código

### Requisitos del ejemplo
- **Ejemplos completos y funcionales** que compilan/corren.
- **Casos de uso realistas**, no demos triviales.
- **Sintaxis específica de la versión** actual del proyecto.
- **Manejo de errores apropiado** incluido.
- **Comentarios que explican** las partes no obvias.

### Requisitos de contexto
- **Incluir la configuración de dependencias** cuando sea relevante.
- **Mostrar imports y configuración** necesarios.
- **Demostrar escenarios del mundo real**.
- **Probar los ejemplos** contra el código actual.

### Enfoque de ejemplos para librerías
- **Perspectiva del proyecto consumidor**: cómo se usa, no cómo funciona internamente.
- **Escenarios de integración**: uso realista en proyectos de quien la consume.
- **Demostración de la API pública**: enfocada en la funcionalidad expuesta.

## Estándares de formato

### Formato de código
- **Resaltado de sintaxis apropiado** en todos los bloques de código.
- **Indentación y espaciado consistentes**.
- **Especificación de lenguaje** en los code fences.
- **Nombres de variable con sentido** en los ejemplos.

### Formato de referencias cruzadas
- **Enlaces relativos** entre archivos de documentación.
- **Enlaces de ancla** a secciones específicas cuando ayude.
- **Enlaces externos** con URLs completas.
- **Verificación de enlaces** durante actualizaciones.

## Requisitos de alineación de versión

### Sincronización con el código
- Las **firmas de API** tienen que reflejar la implementación actual.
- La **disponibilidad de features** tiene que estar actualizada y ser precisa.
- Las **versiones de dependencias** tienen que coincidir con la configuración del proyecto.
- Los **cambios que rompen compatibilidad** se documentan con guías de migración.

### Mantenimiento de la consistencia
- **Actualizar toda la documentación afectada** cuando cambia el código.
- **Verificar que los ejemplos** funcionen con la versión actual.
- **Revisar las matrices de compatibilidad** para que sean precisas.

## Estándares de calidad

### Requisitos de precisión
- **Probar todos los ejemplos** contra el código actual.
- **Verificar todos los enlaces** y referencias.
- **Validar las instrucciones de instalación** en entornos limpios.
- **Chequear la compatibilidad de versiones** en toda la documentación.

### Criterios de completitud
- **Cubrir las features principales** con el detalle apropiado.
- **Incluir los casos de uso comunes** y sus escenarios.
- **Atender las preguntas y problemas frecuentes**.
- **Dar próximos pasos claros** para el usuario.

### Enfoque en la experiencia de usuario
- **Minimizar el tiempo hasta el primer éxito** para quien recién llega.
- **Rutas de aprendizaje claras** para distintos niveles de habilidad.
- **Secciones de resolución de problemas** para cuestiones comunes.
- **Resolución de problemas autoservicio**.

## Consideraciones de integración

### Relación con la documentación de IA
- **Complementar, no duplicar** las instrucciones de IA en `/docs/instructions`.
- **Dar contexto humano** y razonamiento.
- **Enfocarse en la experiencia de usuario** más que en la implementación.
- **Mantener consistencia** donde el contenido se superpone.

### Consistencia entre proyectos
- **Usar los patrones ya establecidos** en otra documentación del proyecto.
- **Seguir los estándares de la organización** para proyectos de tipo similar.
- **Referenciar terminología y convenciones** comunes.

## Ejemplos

### Buena estructura de ejemplo de código
```markdown
## Uso de la feature

### Ejemplo básico
```java
// Configurar la librería
Config config = Config.builder()
    .timeout(Duration.ofSeconds(10))
    .retries(3)
    .build();

// Crear y usar el servicio
MiServicio servicio = new MiServicio(config);
try {
    Resultado resultado = servicio.procesar("datos de entrada");
    System.out.println("Éxito: " + resultado.getValor());
} catch (ProcessingException e) {
    System.err.println("Falló el procesamiento: " + e.getMessage());
}
```

### Configuración avanzada
```java
// Configuración personalizada para entornos de producción
Config config = Config.builder()
    .timeout(Duration.ofMinutes(5))
    .retries(10)
    .backoffStrategy(ExponentialBackoff.create())
    .errorHandler(manejadorDeErroresPersonalizado)
    .build();
```
```

### Buena sección de resolución de problemas
```markdown
## Resolución de problemas

### Problemas comunes

#### Timeout de conexión
**Problema**: las operaciones fallan con errores de timeout.
**Solución**: aumentar la configuración de timeout o revisar la conectividad de red.
```java
Config config = Config.builder()
    .timeout(Duration.ofMinutes(2)) // aumentado desde el valor por defecto
    .build();
```

#### Compatibilidad de versión
**Problema**: `NoSuchMethodError` al llamar a métodos de la librería.
**Solución**: verificar que la versión de la librería coincida con la de la documentación.
- Versión actual de la documentación: 2.1.0
- Revisá que la declaración de tu dependencia coincida con esta versión.
```
