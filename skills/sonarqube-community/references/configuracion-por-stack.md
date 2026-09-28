# Configuración por stack

La tabla de detección está en [`../SKILL.md`](../SKILL.md). Aquí va la configuración
concreta de cada caso, una vez sabes cuál es.

## Antes de escribir nada: inspecciona el proyecto

Proponer configuración sin mirar el repositorio produce exclusiones que no corresponden a
nada y rutas de cobertura que no existen — y el síntoma es un proyecto con 0 % de cobertura
que nadie sabe explicar.

```bash
ls package.json angular.json pom.xml build.gradle tsconfig.json 2>/dev/null

# Qué framework y qué runner de tests hay realmente
cat package.json | grep -E '"(react|vue|@angular/core|next|vite|jest|vitest|karma)"'

# Dónde caen de verdad los informes de cobertura
find . -name 'lcov.info' -o -name 'jacoco.xml' -not -path '*/node_modules/*' 2>/dev/null
```

Tres preguntas que hay que responder antes de configurar:

1. **¿Dónde están las fuentes y dónde los tests?** Si los tests entran como fuentes, sus
   smells cuentan como deuda del producto y el gate falla por código de prueba.
2. **¿Hay informe de cobertura y en qué formato?** SonarQube no ejecuta tests: importa
   informes. Sin informe, 0 %.
3. **¿Qué hay generado o de terceros dentro del repositorio?** Todo lo que no se mantiene a
   mano se excluye, o entierra los issues reales.

## Node.js y TypeScript

Scanner CLI. El analizador de JS/TS va incluido, no hay que instalar nada.

```properties
sonar.projectKey=mi-api
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.spec.ts,**/*.test.ts
sonar.sourceEncoding=UTF-8

# Deja que el analizador resuelva tipos: con tsconfig detecta bastante más
sonar.typescript.tsconfigPaths=tsconfig.json

sonar.javascript.lcov.reportPaths=coverage/lcov.info

sonar.exclusions=**/node_modules/**,**/dist/**,**/build/**,**/*.d.ts,**/*.min.js
sonar.coverage.exclusions=**/*.spec.ts,**/*.test.ts,**/*.config.ts,**/main.ts
```

Detalles que cambian el resultado:

- **`sonar.tests` y `sonar.sources` pueden apuntar al mismo directorio** si los tests viven
  junto al código, que es lo habitual en Node. Lo que separa uno de otro es
  `sonar.test.inclusions`. Sin ella, los specs se analizan como producto.
- **`tsconfigPaths` no es decorativo.** Con el `tsconfig.json` el analizador tiene tipos y
  aplica reglas que sin él no puede: promesas sin `await`, comparaciones imposibles,
  nulabilidad. Es la diferencia entre un análisis útil y un linter de sintaxis.
- **`sonar.coverage.exclusions` no es lo mismo que `sonar.exclusions`.** La primera excluye
  del cálculo de cobertura pero sigue buscando bugs; la segunda saca el archivo del análisis
  entero. Los archivos de configuración y los puntos de entrada van en la primera: no tiene
  sentido exigirles cobertura, pero sí que se revisen.
- **`.d.ts` fuera.** Son declaraciones sin ejecución; solo generan ruido.

Los tests tienen que correr **antes** del scanner y con el reporter de cobertura activo:

```bash
npm test -- --coverage   # genera coverage/lcov.info
sonar-scanner
```

En un monorepo con workspaces, cada paquete puede emitir su propio `lcov.info` y se listan
separados por coma; o se configura un proyecto por paquete, que da métricas más legibles a
costa de más configuración.

## Angular

Como Node/TS, con las particularidades del CLI de Angular.

```properties
sonar.projectKey=mi-app-angular
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.spec.ts
sonar.sourceEncoding=UTF-8

sonar.typescript.tsconfigPaths=tsconfig.json
sonar.javascript.lcov.reportPaths=coverage/mi-app-angular/lcov.info

sonar.exclusions=**/node_modules/**,**/dist/**,**/*.spec.ts,src/environments/**,**/*.module.ts
sonar.coverage.exclusions=**/*.spec.ts,src/main.ts,src/polyfills.ts,**/*.module.ts
```

- **La ruta de cobertura lleva el nombre del proyecto dentro.** El CLI escribe en
  `coverage/<nombre-del-proyecto>/lcov.info`, según el `angular.json`. Es el error más
  común: se copia `coverage/lcov.info` de un ejemplo genérico, el archivo no existe y la
  cobertura sale en 0 sin ningún aviso.
- **Karma necesita ejecutarse sin ventana y sin quedarse esperando** en CI:
  `ng test --no-watch --code-coverage --browsers=ChromeHeadless`. Sin `--no-watch` el paso
  de CI no termina nunca.
- **`src/environments/`** son valores de configuración por entorno; sus "constantes
  duplicadas" son intencionadas.
- **Los `.module.ts`** de un proyecto con NgModules son declarativos: la métrica de
  complejidad y la duplicación no significan nada ahí. En un proyecto standalone este
  patrón ya no aplica y se puede quitar.
- **Las plantillas HTML se analizan**, y ahí están las reglas de accesibilidad. Si excluyes
  `**/*.html` por reducir ruido, pierdes justo lo que el linter de TypeScript no ve.

## Java con Maven

**El scanner va dentro del build, nunca aparte.** Es la regla que más se incumple y la que
más silenciosamente degrada el análisis: sin bytecode ni classpath no hay inferencia de
tipos y se pierde la mayoría de las reglas de Java, sin que el informe diga que faltan.

```bash
mvn clean verify sonar:sonar
```

`verify` antes de `sonar:sonar` en la **misma** invocación: el plugin lee lo que la fase de
build acaba de producir, incluido el informe de JaCoCo. Dos comandos separados no comparten
el estado de la reactor build.

Cobertura con JaCoCo, en el `pom.xml`:

```xml
<plugin>
  <groupId>org.jacoco</groupId>
  <artifactId>jacoco-maven-plugin</artifactId>
  <version>0.8.13</version>
  <executions>
    <execution>
      <id>prepare-agent</id>
      <goals><goal>prepare-agent</goal></goals>
    </execution>
    <execution>
      <id>report</id>
      <phase>verify</phase>
      <!-- Solo XML: es el único formato que SonarQube lee -->
      <goals><goal>report</goal></goals>
    </execution>
  </executions>
</plugin>
```

- **JaCoCo tiene que generar XML.** El `.exec` binario **no** lo lee SonarQube, y el HTML
  tampoco. Es la causa número uno de "tengo tests y me sale 0 % de cobertura".
- Con la configuración por defecto el informe cae en `target/site/jacoco/jacoco.xml` y el
  scanner lo encuentra solo. Si lo mueves, declara
  `sonar.coverage.jacoco.xmlReportPaths`.
- **En multi-módulo**, la cobertura de un test que cruza módulos solo aparece con un informe
  agregado (un módulo dedicado con el goal `report-aggregate`) y
  `sonar.coverage.jacoco.aggregateXmlReportPaths`. Además, `sonar.sources` debe apuntar a
  las rutas exactas de las fuentes de cada módulo, no a un directorio padre común: si
  apuntas al padre, la importación del agregado falla en silencio.

Propiedades en el `pom.xml`, no en `sonar-project.properties` — con el plugin de Maven ese
archivo se ignora:

```xml
<properties>
  <sonar.projectKey>mi-servicio</sonar.projectKey>
  <sonar.exclusions>**/generated/**,**/*Dto.java</sonar.exclusions>
</properties>
```

En un proyecto Java 8 antiguo hay un límite que aparece pronto: **las versiones recientes
del analizador requieren que el build corra sobre una JVM moderna**, aunque el `target` de
compilación siga siendo 1.8. Compilar con Java 8 y analizar con una JVM 17 o superior es
compatible; intentar ejecutar el scanner con la JVM 8 no lo es. Si no puedes cambiar la JVM
del runner, el camino es fijar una versión antigua del plugin, con el coste de perder reglas
nuevas.

## Vanilla JS legacy, sin bundler ni npm

El caso más incómodo y el peor documentado: no hay `package.json`, no hay tests, no hay
cobertura, y conviven fuentes propias con librerías descargadas a mano.

```properties
sonar.projectKey=portal-legacy

# Apunta SOLO a lo que mantenéis vosotros
sonar.sources=WebContent/js/app,WebContent/css,WebContent/jsp
sonar.sourceEncoding=ISO-8859-1

# Librerías de terceros dentro del repositorio: no son vuestro código
sonar.exclusions=**/lib/**,**/vendor/**,**/*.min.js,**/jquery*.js,**/generated/**

# No hay tests. Que el gate no exija cobertura de lo que no se puede cubrir
sonar.coverage.exclusions=**/*
```

- **`sonar.sourceEncoding` importa de verdad aquí.** Un proyecto antiguo suele estar en
  ISO-8859-1 o Windows-1252; si declaras UTF-8, las tildes se leen como caracteres
  inválidos y aparecen issues absurdos en archivos correctos. Compruébalo antes:
  `file -i <archivo>`.
- **Lista las fuentes una por una en lugar de apuntar a la raíz.** En un repositorio legacy
  la raíz arrastra `.min.js`, copias de jQuery, generados de XSL y builds antiguos. Con
  `sonar.sources=.` el análisis se llena de issues de código que nadie escribió ni va a
  tocar, y el proyecto se abandona en la primera revisión.
- **`sonar.coverage.exclusions=**/*` es deliberado**, no un atajo. Sin tests, la cobertura
  es 0 y el gate falla siempre; un gate que falla siempre se ignora y deja de proteger
  nada. Se excluye la cobertura, se deja el gate vigilando bugs y duplicación, y se retira
  la exclusión el día que haya tests.
- **Las JSP se analizan**, y con ellas las plantillas donde suele estar el XSS por
  concatenación. Merece la pena incluirlas.
- Los archivos de un solo `<script>` global con miles de líneas darán complejidad altísima.
  Eso es **información correcta**, no ruido: es el mapa de por dónde empezar a partir el
  código.

## Fuentes

- [Parámetros de análisis](https://docs.sonarsource.com/sonarqube-community-build/analyzing-source-code/analysis-parameters)
- [Cobertura de JavaScript/TypeScript](https://docs.sonarsource.com/sonarqube-community-build/analyzing-source-code/test-coverage/javascript-typescript-test-coverage)
- [Cobertura de Java](https://docs.sonarsource.com/sonarqube-community-build/analyzing-source-code/test-coverage/java-test-coverage)
