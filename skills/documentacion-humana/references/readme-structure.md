# Guías de estructura del README

## Propósito

Define los requisitos de estructura para archivos `README.md`: organización de secciones,
contenido requerido, y las diferencias entre librería y aplicación. Busca una documentación
de proyecto consistente y orientada al usuario.

## Secciones requeridas del README

Seguí este orden exacto para todos los `README.md`:

### 1. Título y descripción rápida
- **Encabezado H1 con el nombre del proyecto**
- **Descripción de una frase** del propósito del proyecto
- **Resumen breve** (1-2 párrafos como máximo)

### 2. Integración y/o instalación
**Para librerías**: fragmentos de dependencia, información de versión, información del
registro de paquetes.
**Para aplicaciones**: enlaces de descarga, requisitos del sistema, prerrequisitos.

### 3. Ejecución (solo aplicaciones)
- Uso básico desde línea de comandos
- Ubicación de archivos de configuración
- Variables de entorno y perfiles

### 4. Tabla de contenidos
- Índice estructurado que enlaza a la documentación de `/docs`
- Agrupación lógica de temas
- Enlaces relativos a archivos de `/docs`

### 5. Inicio rápido
**Para librerías**: un fragmento de código pequeño y funcional que muestre el uso central
de la API desde la perspectiva del consumidor.
**Para aplicaciones**: un comando ejecutable básico o una llamada a la API que muestre la
funcionalidad central.

### 6. Arquitectura
- Resumen general de la estructura del proyecto
- Carpetas y componentes clave (a alto nivel)
- Organización de recursos

### 7. Filosofía de diseño
- Decisiones de diseño deliberadas y su razonamiento
- Patrones arquitectónicos usados
- Principios clave y trade-offs

## Enfoque librería vs aplicación

### Librerías
- **Perspectiva de consumidor**: cómo integran y usan la librería quienes desarrollan.
- **Enfoque en la API pública**: mostrar la funcionalidad central disponible para quien la
  usa.
- **Evitar lo interno**: saltear detalles de implementación y arquitectura interna.
- **Ejemplos de integración**: mostrar escenarios de uso realistas.

### Aplicaciones
- **Operaciones de usuario**: comandos, configuración, despliegue.
- **Demostraciones funcionales**: llamadas a la API, flujos, funcionalidades.
- **Contexto operacional**: configuración del entorno, perfiles, escalado.

## Requisitos de localización

### Nivel raíz
- **Principal**: `README.md` (en el idioma por defecto del proyecto).
- **Adicionales**: `README.{código-de-idioma}.md` (p. ej. `README.es.md`, `README.fr.md`).

### Versiones por idioma
- **Replicación completa de la estructura** en todas las versiones de idioma.
- **Mantener el mismo orden de secciones** y el mismo enfoque de contenido.
- **Actualizar todas las versiones** al hacer cambios estructurales.

## Requisitos de contenido

### Alineación de versión
- Los **ejemplos de código** tienen que funcionar con la versión actual del proyecto.
- Las **versiones de dependencias** tienen que coincidir con la configuración del proyecto.
- La **disponibilidad de features** tiene que estar actualizada y ser precisa.

### Enfoque en la experiencia de usuario
- **Minimizar el tiempo hasta el primer éxito** para quien recién llega.
- Ejemplos **inmediatamente ejecutables** después de la instalación/configuración.
- **Próximos pasos claros** que dirijan hacia la documentación detallada.

## Ejemplos

### Sección de integración de librería
```markdown
## Integración

Agregá la dependencia a tu proyecto:

### Maven
```xml
<dependency>
    <groupId>com.ejemplo</groupId>
    <artifactId>mi-libreria</artifactId>
    <version>1.2.3</version>
</dependency>
```

### Gradle
```groovy
implementation 'com.ejemplo:mi-libreria:1.2.3'
```
```

### Sección de inicio rápido de librería
```markdown
## Inicio rápido

```java
import com.ejemplo.MiLibreria;

public class Ejemplo {
    public static void main(String[] args) {
        MiLibreria lib = new MiLibreria();
        String resultado = lib.procesar("datos de entrada");
        System.out.println(resultado);
    }
}
```
```

### Sección de instalación de aplicación
```markdown
## Instalación

### Descarga
Descargá la última versión desde la [página de releases](releases).

### Requisitos del sistema
- Java 11 o superior
- 512MB de RAM como mínimo
- Puerto 8080 disponible

### Configuración
Copiá `config/application-example.yml` a `config/application.yml` y actualizá los valores.
```
