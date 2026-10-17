---
name: documentacion-humana
description: Guía independiente para generar o actualizar documentación legible por humanos (README, carpeta /docs) siguiendo una estructura estandarizada. Úsala cuando el usuario pida escribir o actualizar un README, organizar la carpeta /docs, o mejorar la documentación orientada a personas de un proyecto. No la uses para documentación dirigida a agentes de IA (CLAUDE.md, AGENTS.md, /docs/instructions) ni para especificaciones de API.
---

# Guías de documentación humana

Skill independiente con guías para crear y mantener documentación legible por humanos.
Estas guías aplican a toda la documentación orientada a personas, separada de las
instrucciones para agentes de IA.

## Alcance

**Aplica a:**
- El `README.md` de la raíz del proyecto y sus versiones localizadas (p. ej. `README.en.md`).
- Todos los archivos de la carpeta `/docs` y sus subcarpetas por idioma.
- Documentación legible por humanos de librerías y aplicaciones.

**Excluido:**
- Documentación para agentes de IA (`CLAUDE.md`, `AGENTS.md` y la carpeta
  `/docs/instructions`).
- Documentación interna de desarrollo.
- Archivos de especificación de API.

## Árbol de decisión

Seguí siempre este árbol al crear o actualizar documentación humana:

1. **Para archivos `README.md`**: usá la estructura estandarizada con las secciones
   requeridas — ver [Estructura del README](references/readme-structure.md).
2. **Para el contenido de la carpeta `/docs`**: seguí los patrones de organización y los
   archivos núcleo requeridos — ver
   [Organización de la documentación](references/docs-organization.md).
3. **Para todo el contenido de documentación**: aplicá los estándares de escritura y
   calidad — ver [Guías de contenido](references/content-guidelines.md).
4. **Para actualizaciones de documentación**: seguí los procesos de mantenimiento y flujo
   de trabajo — ver
   [Mantenimiento y flujo de trabajo](references/maintenance-workflow.md).

## Reglas de prioridad

Usá estas reglas en orden descendente de prioridad:

1. **Primero la perspectiva del usuario**: enfocate en lo que el usuario necesita saber,
   no en los detalles internos de implementación.
2. **Enfoque de consumidor para librerías**: priorizá cómo se usa la librería, no cómo está
   construida.
3. **Ejemplos ejecutables**: todo fragmento de código tiene que funcionar con la versión
   actual del proyecto.
4. **Complejidad progresiva**: estructurá el contenido de lo básico a lo avanzado.
5. **Mantené la consistencia**: usá la misma terminología y los mismos patrones en toda la
   documentación.
