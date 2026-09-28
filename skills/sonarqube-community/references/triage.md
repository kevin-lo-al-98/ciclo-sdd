# Triage: qué arreglar, qué negociar y qué silenciar

El primer análisis de un proyecto vivo devuelve cientos o miles de issues. La reacción
habitual —ordenar por severidad y empezar por arriba— es la forma más rápida de abandonar:
las listas largas ordenadas por gravedad nominal mezclan fallos reales con reglas de estilo
marcadas como críticas.

Los principios están en [`../SKILL.md`](../SKILL.md). Aquí, el procedimiento.

## Proyecto heredado: los primeros pasos

**No intentes bajar la deuda histórica.** Es trabajo sin final y sin beneficio medible, y
además cada cambio en código antiguo sin tests es un riesgo real de regresión. Lo que hace
usable la herramienta es congelar el pasado y vigilar lo nuevo.

1. **Fija la definición de código nuevo** antes de mirar un solo issue. En Community, *desde
   los últimos 30 días* o *desde la versión previa*. Sin esto, todo lo que sigue mide el
   repositorio entero.
2. **Mira solo la pestaña de código nuevo.** La cifra global de issues es contexto
   histórico, no una lista de tareas.
3. **Revisa los security hotspots una vez, enteros.** Suelen ser pocos y son los únicos que
   exigen decisión humana sí o sí. Cada uno se marca como *safe* con motivo o se arregla.
   Dejar 200 hotspots sin revisar equivale a no tenerlos.
4. **Ajusta el quality profile** con lo que aprendas de los falsos positivos de esta primera
   pasada. Es más rentable que ir marcando issues uno a uno.
5. **Activa el gate solo en aviso** durante un par de semanas, y luego bloqueante. Un gate
   que rompe el build el primer día se desactiva y no vuelve.

## Orden de atención

| Tipo | Qué es | Qué hacer |
|---|---|---|
| **Bug** | Fallo probable en ejecución | Arreglar. Es el único tipo que justifica tocar código antiguo |
| **Vulnerability** | Fallo de seguridad con recorrido confirmado | Arreglar, con prioridad sobre los bugs |
| **Security hotspot** | Punto sensible que exige revisión | Revisar y marcar, siempre con motivo |
| **Code smell** | Coste de mantenimiento | Solo en código nuevo, o al pasar por ahí por otro motivo |

La severidad que asigna SonarQube es una propiedad de la **regla**, no de tu caso concreto.
Un `MAJOR` en una función de logging que corre una vez al arrancar importa menos que un
`MINOR` en el cálculo de un importe. El juicio sobre el impacto es tuyo; la herramienta no
conoce tu dominio.

## Las cuatro salidas para un issue

En orden de preferencia. La de más abajo que uses, peor:

1. **Arreglarlo.** La única que reduce el problema.
2. **Marcarlo en la interfaz** como *False positive* o *Won't fix*, con un motivo escrito.
   Queda registrado, es auditable, no reaparece y cualquiera puede revisar la decisión más
   tarde.
3. **Desactivar la regla en el quality profile.** La decisión correcta cuando la regla no
   encaja con el proyecto y la marcas por tercera vez. Se toma una vez, en un sitio visible,
   y queda documentada para todo el equipo.
4. **`// NOSONAR`.** Último recurso.

### Por qué `NOSONAR` es el último recurso

Silencia **todas** las reglas de esa línea, no la que molestaba. Quien lo lea en seis meses
no sabrá qué se estaba silenciando ni por qué, y cuando esa línea desarrolle un problema
distinto, no habrá aviso. Encima, el comentario viaja con el código y sobrevive a
refactorizaciones que lo dejan sin sentido.

Si lo usas, un motivo al lado es el mínimo:

```java
// NOSONAR: la ruta la fija la configuración del servidor, no entra por petición
```

**Que `NOSONAR` aparezca muchas veces no es un problema de disciplina: es el síntoma de un
quality profile mal ajustado.** Cuenta cuántas hay antes de añadir una más; si pasan de un
puñado, el arreglo es el perfil.

## Ajustar el quality profile

El perfil por defecto, *Sonar way*, es un punto de partida, no una imposición. Nunca se
edita directamente: **se copia y se modifica la copia**, porque el original se sobreescribe
al actualizar el analizador.

Reglas que conviene revisar pronto porque generan mucho ruido con poco valor en según qué
proyectos:

- **Complejidad ciclomática y longitud de función**, en código legacy. La información es
  correcta pero ya la conoces, y llena la lista.
- **Nombres de variables y convenciones de formato**, si ya tienes ESLint, Prettier o
  Checkstyle. Duplicar el mismo criterio en dos herramientas garantiza que un día se
  contradigan, y el equipo obedecerá a la que rompe el build.
- **Reglas de comentarios obligatorios** (Javadoc en todo método público). Producen
  comentarios que repiten el nombre del método y no informan de nada.
- **Duplicación en tests.** Los tests se parecen entre sí por diseño; que un test sea
  explícito y repetitivo suele ser una virtud, no deuda.

Lo que **no** se desactiva por ruido: nada de la categoría de seguridad. Ahí el coste de un
falso negativo no se parece al de un falso positivo. Los falsos positivos de seguridad se
marcan uno a uno, que es tedioso y es el precio correcto.

## Cuando el gate falla y no está claro por qué

Por orden de frecuencia:

1. **Cobertura en 0 %.** El informe no se generó, o la ruta de
   `sonar.*.lcov.reportPaths` / `sonar.coverage.jacoco.xmlReportPaths` no coincide con dónde
   cayó. Compruébalo con `find` antes de suponer nada — es el fallo más común de todos.
2. **La definición de código nuevo abarca el repositorio entero.** Entonces el gate mide
   toda la historia contra umbrales pensados para un cambio.
3. **El checkout de CI es superficial.** Sin `fetch-depth: 0`, SonarQube no puede fechar las
   líneas y el cálculo de código nuevo sale mal.
4. **Duplicación por encima del 3 %** en un cambio que añade un módulo parecido a otro
   existente. Suele ser un hallazgo legítimo: hay una abstracción sin extraer.
5. **El paso de CI pasa en verde aunque el gate falle**, porque falta
   `-Dsonar.qualitygate.wait=true`. El análisis se envía y el paso termina sin esperar el
   veredicto.

## Métricas: qué significan y qué no

- **Deuda técnica en minutos u horas.** Una constante por tipo de issue, sumada. Sirve para
  comparar módulos del mismo proyecto entre sí. No es una estimación del trabajo de tu
  equipo y no debe aparecer en una planificación como si fuera un plazo.
- **Grado A–E de mantenibilidad.** Es el ratio entre la deuda estimada y el coste estimado
  de reescribir el proyecto. Depende del tamaño: un proyecto grande absorbe más issues antes
  de bajar de nota. **Comparar el grado entre dos repositorios distintos no dice nada.**
- **Cobertura.** Mide líneas ejecutadas por los tests, no que estén verificadas. Un test sin
  aserciones cubre igual. Un 80 % es un umbral razonable como puerta; como objetivo en sí
  mismo produce tests que solo existen para subir el número.
- **Líneas de código.** SonarQube cuenta las de las fuentes que le declaras. Si la cifra te
  sorprende, es que `sonar.sources` o `sonar.exclusions` están mal: revísalo, porque afecta a
  todas las demás métricas.

## Fuentes

- [Quality gates](https://docs.sonarsource.com/sonarqube-community-build/instance-administration/analysis-functions/quality-gates)
- [Quality profiles](https://docs.sonarsource.com/sonarqube-community-build/instance-administration/analysis-functions/quality-profiles)
- [Definición de código nuevo](https://docs.sonarsource.com/sonarqube-community-build/project-administration/defining-new-code)
