# Guías de mantenimiento y flujo de trabajo

## Propósito

Define los procesos para actualizar documentación, el aseguramiento de calidad y la
gestión de su ciclo de vida. Busca que la documentación se mantenga vigente, precisa y
alineada con los cambios de código.

## Procesos de actualización regular

### Integración con cambios de código
- **Alinear la documentación** con los cambios de código durante el desarrollo.
- **Actualizar los ejemplos** cuando cambian las APIs.
- **Modificar las referencias de versión** en cada release.
- **Revisar las secciones afectadas** para verificar su precisión.

### Flujo de trabajo de release de versión
- **Validar todos los ejemplos** antes de publicar una versión.
- **Actualizar las instrucciones de instalación** con los números de versión nuevos.
- **Verificar la precisión de los enlaces** en toda la documentación.
- **Actualizar las matrices de compatibilidad** si corresponde.

### Integración de feedback
- **Revisar el feedback de usuarios** y los problemas comunes con regularidad.
- **Actualizar la documentación** según las preguntas de soporte.
- **Agregar secciones de resolución de problemas** para problemas frecuentes.
- **Mejorar la claridad** donde el usuario tenga dificultades.

## Requisitos de aseguramiento de calidad

### Validación previa al release
- **Probar las instrucciones de instalación** en entornos limpios.
- **Verificar que los ejemplos de código** se ejecuten correctamente.
- **Chequear todos los enlaces internos** para verificar su precisión.
- **Validar que las referencias externas** sigan accesibles.

### Proceso de revisión por pares
- **Los cambios de documentación** requieren revisión antes de integrarse.
- **Verificación de precisión técnica** por quien conoce el tema.
- **Chequeos de calidad de escritura** y consistencia.
- **Evaluación de experiencia de usuario**.

### Verificación automatizada
- **Automatización de chequeo de enlaces** donde sea posible.
- **Verificación de ejemplos** como parte del pipeline de CI/CD.
- **Chequeos de alineación de versión** en el proceso de build.
- **Integración de herramientas de validación de consistencia**.

## Integración con documentación de IA

### Requisitos de coordinación
- **Evitar la duplicación** con las instrucciones de IA en `/docs/instructions`.
- **Mantener consistencia** donde el contenido se superpone.
- **Referenciar la documentación de IA** cuando corresponda, para detalles de
  implementación.
- **Enfocarse en el contexto humano** que la documentación de IA no puede dar.

### Separación de contenido
- **Documentación humana**: experiencia de usuario, razonamiento, contexto.
- **Documentación de IA**: patrones de implementación, reglas de generación de código.
- **Preocupaciones compartidas**: compatibilidad de versión, decisiones arquitectónicas.

## Mantenimiento a largo plazo

### Gestión de deuda de documentación
- **Auditorías regulares** para contenido desactualizado.
- **Actualizaciones sistemáticas** durante releases mayores.
- **Consolidación de contenido** cuando las secciones se vuelven redundantes.
- **Archivar documentación obsoleta** de forma apropiada.

### Consideraciones de escalabilidad
- **Estructura modular** que habilita actualizaciones independientes.
- **Consistencia de plantillas** que reduce el costo de mantenimiento.
- **Mantenimiento sistemático de referencias cruzadas**.
- **Sincronización de localización** entre versiones de idioma.

## Guías de proceso

### Priorización de actualizaciones
1. **Crítico**: problemas de seguridad, cambios que rompen compatibilidad, problemas de
   instalación.
2. **Alto**: features nuevas, cambios de API, actualizaciones de configuración.
3. **Medio**: aclaraciones, ejemplos adicionales, referencias cruzadas.
4. **Bajo**: mejoras de estilo, correcciones menores.

### Documentación de cambios
- **Registrar los cambios significativos** en las notas de release.
- **Documentar los cambios que rompen compatibilidad** con guías de migración.
- **Comunicar las deprecaciones** con información de cronograma.
- **Dar rutas de actualización** para los usuarios.

## Métricas de calidad

### Indicadores de precisión
- **Tasa de éxito de ejemplos**: porcentaje de ejemplos de código que funcionan.
- **Salud de enlaces**: porcentaje de enlaces internos/externos funcionales.
- **Alineación de versión**: vigencia de la información específica de versión.
- **Feedback de usuarios**: tasas de éxito de quienes usan la documentación.

### Medidas de completitud
- **Cobertura de features**: existe documentación para todas las features públicas.
- **Cobertura de casos de uso**: los escenarios comunes están documentados.
- **Resolución de preguntas**: completitud de FAQ y resolución de problemas.

## Ejemplos

### Plantilla de revisión de documentación
```markdown
## Revisión de documentación

### Precisión técnica
- [ ] Los ejemplos de código compilan y corren
- [ ] Las firmas de API coinciden con la implementación actual
- [ ] Las opciones de configuración están actualizadas
- [ ] Los requisitos de versión son precisos

### Experiencia de usuario
- [ ] Progresión clara de lo básico a lo avanzado
- [ ] Los ejemplos son realistas y útiles
- [ ] La resolución de problemas cubre los casos comunes
- [ ] Los próximos pasos son claros para el usuario

### Estándares de calidad
- [ ] La escritura es clara y concisa
- [ ] El formato es consistente
- [ ] Los enlaces funcionan y son relevantes
- [ ] Las referencias cruzadas son precisas
```
