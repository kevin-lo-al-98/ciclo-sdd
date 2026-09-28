---
name: sonarqube-community
description: Analizar código con SonarQube Community Build — levantar el servidor, configurar el scanner según cómo esté construido el proyecto, integrarlo en CI y decidir qué issues arreglar. Úsala cuando el usuario diga "sonarqube", "sonar", "sonarscanner", "sonarlint", "quality gate", "análisis estático", "code smells", "deuda técnica", "cobertura en sonar", "el sonar me marca esto", "cómo monto sonar", "por qué no analiza mi rama", "no me decora el pull request". Incluye la limitación central de la edición Community —solo analiza la rama principal— y las tres salidas reales. No la uses para configurar ESLint, Prettier u otros linters locales, ni para escanear dependencias (Dependabot, Snyk), ni para auditar una skill de terceros: eso es `skill-security-scan`.
---

# SonarQube Community Build

Servidor propio de análisis estático. Recibe el código de un **scanner** que corre en la
máquina o en CI, aplica un conjunto de reglas y publica issues, cobertura y duplicación
en un proyecto con historial.

No sustituye al linter. ESLint o Checkstyle corren en milisegundos y se autoarreglan;
SonarQube aporta lo que un linter no hace: análisis entre archivos, historial, una única
fuente de verdad para el equipo y un **quality gate** que puede tumbar el build.

## La restricción que lo define todo

**Community Build analiza una sola rama: la principal.** No hay análisis de ramas ni
decoración de pull requests — son de pago, desde Developer Edition.

La consecuencia hay que decirla antes de montar nada: el equipo se enterará de los
problemas **después** del merge. El modelo que SonarQube vende, *Clean as You Code*
—no arreglar la deuda histórica, solo exigir que lo nuevo entre limpio—, se apoya en el
análisis del PR. Sin él, un quality gate en CI sobre la rama principal no previene: solo
acusa, cuando el código ya está dentro.

Hay tres salidas y conviene elegir **antes** de la primera instalación, porque cambian el
montaje entero. La soportada es **SonarQube for IDE** en *connected mode*: baja las reglas
del servidor al editor y el problema se ve al escribirlo. Las otras dos —un proyecto por
rama, o el plugin de ramas de terceros— y sus costes están en
[`references/ramas-y-prs.md`](references/ramas-y-prs.md).

## Cómo trabajas

1. **Detecta cómo está construido el proyecto antes de proponer configuración.** La tabla
   siguiente. Sin esto se acaba recomendando el scanner CLI en un proyecto Maven, que
   analiza pero pierde la mayoría de las reglas de Java.
2. **Averigua si ya hay servidor.** Un `sonar-project.properties`, un `SONAR_HOST_URL` en
   el CI o un `sonar.host.url` en el `pom.xml` significan que ya hay instancia y que no
   hay que levantar nada.
3. Leer y detectar lo haces directo. **Anuncia antes de ejecutar** cualquier
   `docker compose up`, cualquier análisis contra un servidor compartido y cualquier
   cambio en el pipeline de CI: el primero ocupa unos 2 GB de RAM en la máquina del
   usuario, el segundo escribe en un proyecto que ve todo el equipo.
4. **Nunca pongas un token en un archivo versionado.** Va en el gestor de secretos del CI
   o en una variable de entorno. Un token de SonarQube permite leer todo el código
   indexado y administrar el proyecto.
5. Al activar el gate en un proyecto con historial, **empieza en modo aviso**. Un gate
   bloqueante sobre un repositorio con deuda acumulada rompe el build en el primer push, y
   la reacción del equipo es desactivarlo, no arreglarlo.

## Detectar el stack

Busca en la raíz, en este orden. Gana la señal más específica.

| Señal | Stack | Scanner | Cobertura |
|---|---|---|---|
| `pom.xml` | Java / Maven | `sonar-maven-plugin`, dentro del build | `sonar.coverage.jacoco.xmlReportPaths` |
| `build.gradle` | Java / Gradle | plugin de Gradle, dentro del build | igual, XML de JaCoCo |
| `angular.json` | Angular | CLI | `sonar.javascript.lcov.reportPaths` |
| `package.json` con `react`, `vue`, `next`, `vite` | Front con bundler | CLI | LCOV |
| `package.json` sin framework de front | Node / backend | CLI | LCOV |
| `.js` y `.html` sin `package.json` | Vanilla legacy | CLI | ninguna; ver la referencia |
| `.csproj` / `.sln` | .NET | `dotnet sonarscanner` | fuera del alcance de esta skill |

**La regla que más se incumple:** en Java el scanner va **dentro del build**
(`mvn verify sonar:sonar`), no como paso aparte. El analizador necesita el bytecode
compilado y el classpath; sin ellos no hay inferencia de tipos y se cae la mayoría de las
reglas, sin avisar de que las perdiste. El CLI genérico es para lo que no tiene scanner
propio.

La configuración concreta de cada stack, con exclusiones y cobertura, está en
[`references/configuracion-por-stack.md`](references/configuracion-por-stack.md).

## Configuración mínima

`sonar-project.properties` en la raíz. Lo único obligatorio es `sonar.projectKey`:

```properties
sonar.projectKey=mi-proyecto
sonar.sources=src
sonar.tests=test
sonar.sourceEncoding=UTF-8

# Todo lo generado o ajeno: infla las métricas y entierra los issues reales
sonar.exclusions=**/node_modules/**,**/dist/**,**/vendor/**,**/*.min.js
```

El servidor y el token **no** van aquí: `SONAR_HOST_URL` y `SONAR_TOKEN` como variables de
entorno. Así el archivo se versiona sin filtrar credenciales y el mismo repositorio sirve
contra la instancia local y contra la compartida.

Levantar el servidor, crear el token y lanzar el primer análisis están en
[`references/puesta-en-marcha.md`](references/puesta-en-marcha.md).

## Quality profile y quality gate no son lo mismo

Es la confusión más frecuente y lleva a tocar lo que no toca:

- El **quality profile** decide **qué reglas se aplican** al analizar. Cambiarlo cambia
  los issues que aparecen.
- El **quality gate** decide **qué umbrales debe cumplir el resultado** para dar
  `PASSED`. Cambiarlo no altera lo detectado, solo cuándo falla el build.

El gate por defecto, *Sonar way*, evalúa **solo código nuevo**: cero issues nuevos, 80 %
de cobertura en las líneas añadidas y como máximo 3 % de duplicación.

**Esa definición de "código nuevo" es lo primero que hay que revisar.** Si queda mal
puesta, el gate evalúa el repositorio entero y falla desde el primer día. En Community,
donde solo se analiza la rama principal, la definición útil es *número de días anteriores*
o *desde la versión previa*; la opción por referencia a otra rama no sirve aquí, porque no
hay otras ramas analizadas.

## Triage: qué arreglar y qué no

El primer análisis de un repositorio vivo devuelve cientos o miles de issues. Ordenarlos
por severidad y empezar por arriba es la forma más rápida de abandonar.

- **Bugs antes que code smells.** Un bug es un fallo probable en ejecución; un smell es
  coste de mantenimiento. Los primeros se arreglan, los segundos se negocian.
- **Los security hotspots no son vulnerabilidades.** Son puntos que exigen una decisión
  humana. Se revisan y se marcan; dejarlos acumulados vacía de valor la categoría.
- **La deuda en minutos es una heurística**, no una estimación: una constante por issue.
  Sirve para comparar módulos del mismo proyecto entre sí, nada más. No la lleves a una
  reunión de planificación como si fuera un plazo.
- **El falso positivo se marca en la interfaz** (*False positive* o *Won't fix*), con
  motivo. Queda registrado y no reaparece.
- **`// NOSONAR` es el último recurso.** Silencia todas las reglas de esa línea, no la que
  molestaba, y no deja constancia de por qué. Si aparece más de un puñado de veces, el
  problema es el quality profile: desactiva la regla en el perfil, donde la decisión se
  toma una vez y queda a la vista.

El criterio de priorización, el ajuste del perfil y qué mirar en un proyecto heredado están
en [`references/triage.md`](references/triage.md).

## Lo que SonarQube no cubre

Conviene decirlo cuando alguien lo presenta como la red de seguridad del proyecto:

- **Tus dependencias, no.** Solo tu código. Las CVE de librerías son Dependabot, Renovate,
  `npm audit` o Snyk.
- **La cobertura no la mide él.** La importa de tu herramienta (JaCoCo, lcov). Sin ese paso
  el proyecto sale con 0 % y el gate falla por algo que sí estaba probado.
- **El grado A–E de mantenibilidad es relativo al tamaño.** Comparar la nota entre dos
  repositorios distintos no dice nada.
