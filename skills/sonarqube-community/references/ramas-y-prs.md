# Ramas y pull requests en Community Build

> Última revisión: 2026-09-28. La sección del plugin de terceros cita versiones y
> comportamiento que cambian con cada release de SonarQube. Verifica en
> [su repositorio](https://github.com/mc1arke/sonarqube-community-branch-plugin) antes de
> tocarla.

**Community Build analiza una sola rama, la principal.** No hay análisis de ramas ni
decoración de pull requests: eso empieza en Developer Edition, la primera edición de pago.

Esto no es un detalle de configuración que se pueda ajustar. Es la diferencia de producto
con la que SonarSource monetiza, y por tanto la razón por la que la mayoría de los equipos
acaban pagando: sin análisis de PR no se puede aplicar *Clean as You Code*, que es el modelo
que hace usable la herramienta en un repositorio con historia.

Hay tres salidas. **Elige antes de instalar**, porque cambian el montaje y migrar de una a
otra cuesta.

| | Esfuerzo | Riesgo | Feedback antes del merge |
|---|---|---|---|
| 1. SonarQube for IDE | Bajo | Ninguno | Sí, en el editor |
| 2. Un proyecto por rama | Medio | Ensucia la instancia | Sí, en el servidor |
| 3. Plugin de terceros | Alto | Se rompe al actualizar | Sí, con decoración de PR |

## 1. SonarQube for IDE en connected mode — la soportada

La extensión gratuita de editor (antes SonarLint) se vincula al proyecto del servidor y
descarga su quality profile. Analiza al escribir, con las reglas del equipo.

Es lo que más se parece a lo que ofrece el análisis de PR, y llega antes: el problema se ve
mientras se escribe la línea, no cuando la revisión ya está abierta.

Lo que **no** te da:

- No hay veredicto sobre el conjunto del cambio. Ves tus issues, no un `PASSED`/`FAILED`.
- No hay medición de cobertura de las líneas nuevas — eso solo lo calcula el servidor.
- **No es una puerta.** Depende de que cada persona lo tenga instalado y no lo desactive.

Por eso conviene combinarlo con el gate en CI sobre la rama principal: el IDE previene, el
gate en la rama principal detecta lo que se cuele. No es equivalente al análisis de PR,
pero es la mejor relación coste/beneficio de las tres opciones y no tiene contrapartidas.

## 2. Un proyecto de SonarQube por rama

Truco conocido: como Community no distingue ramas, se le da una **clave de proyecto
distinta** por rama y se aprovecha que sí sabe comparar cada proyecto consigo mismo.

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
sonar-scanner \
  -Dsonar.projectKey="mi-proyecto-${BRANCH//\//-}" \
  -Dsonar.projectName="mi-proyecto [$BRANCH]"
```

Funciona, con costes que hay que aceptar a sabiendas:

- **La instancia se llena de proyectos.** Uno por rama viva, y los de ramas ya borradas se
  quedan hasta que alguien los limpia. Sin una tarea de limpieza —la API
  `POST /api/projects/delete`— es insostenible a partir de unas semanas.
- **No hay comparación con la rama principal.** El "código nuevo" del proyecto de una rama
  se calcula contra el primer análisis *de esa rama*, no contra `main`. Es decir: el número
  que sale no significa lo que crees que significa.
- **Cada proyecto cuenta líneas de código por separado**, lo que distorsiona cualquier
  métrica agregada de la instancia.
- No hay comentarios en el PR. El resultado hay que ir a buscarlo.

Válido como solución temporal para una rama concreta de larga duración —una migración
grande, una refactorización— donde compensa. **Mala idea como política general.**

## 3. `sonarqube-community-branch-plugin` — lo que hace mucha gente

Plugin de terceros que añade análisis de ramas y decoración de PRs a Community Build.
Funciona; la decoración está disponible para GitHub, GitLab, Bitbucket Server y Bitbucket
Cloud. Merece la pena conocerlo porque es lo que el usuario va a encontrar al buscar, y es
mejor que lo encuentre con el contexto puesto.

**Lo que hay que saber antes de instalarlo**, en palabras de su propio README:

> This plugin is not maintained or supported by SonarSource and has no official upgrade path
> for migrating from the SonarQube Community Edition to any of the Commercial Editions.

Y sobre migrar después a una edición comercial: avisa de que **puede perderse parte o todo
el historial**, porque la convivencia de sus datos de rama con los del mecanismo oficial no
está probada. Si existe la posibilidad de pagar Developer Edition más adelante, esto es el
argumento de peso en contra.

Los tres costes concretos:

- **Atado a la versión exacta del servidor.** Las versiones del plugin siguen las de
  SonarQube: `25.4.0` del plugin va con SonarQube `25.4.x`. Y Community Build se actualiza
  por calendario, con frecuencia. Cada actualización del servidor exige esperar a que
  publiquen el plugin correspondiente, y **actualizar sin él deja la instancia sin arrancar**.
  En la práctica el servidor queda congelado en la versión que el plugin soporta.
- **Instalación intrusiva.** No es dejar un JAR y reiniciar: se inyecta como *javaagent* en
  dos procesos y además **reemplaza el directorio `web`** de la interfaz por el
  `sonarqube-webapp.zip` que distribuye. Modifica la aplicación, no la extiende.
- **Al arrancar hay que aceptar un aviso de plugin de terceros**, y el servidor deja de estar
  en un estado que SonarSource pueda dar por bueno si algún día se abre un soporte.

Si aun así es el camino, la vía sostenible es su imagen, que ya lo trae montado, en lugar de
parchear a mano:

```yaml
services:
  sonarqube:
    image: mc1arke/sonarqube-with-community-branch-plugin:26.9.0-community
```

Si la instalación es manual, el plugin necesita ir como javaagent en los dos procesos —`web`
y `ce`— y el modo se pasa en la propia ruta del agente:

```properties
sonar.web.javaAdditionalOpts=-javaagent:./extensions/plugins/sonarqube-community-branch-plugin-${version}.jar=web
sonar.ce.javaAdditionalOpts=-javaagent:./extensions/plugins/sonarqube-community-branch-plugin-${version}.jar=ce
```

Con la imagen Docker, si sobreescribes `SONAR_WEB_JAVAADDITIONALOPTS` o
`SONAR_CE_JAVAADDITIONALOPTS` para cualquier otra cosa, tienes que repetir dentro el
`-javaagent` que traía el Dockerfile. Perderlo silenciosamente es el fallo de configuración
más habitual: el servidor arranca, pero el análisis de ramas deja de funcionar.

Y una trampa de uso: **al analizar un pull request no debe haber ninguna propiedad
`sonar.branch.*` puesta**. Su presencia le indica que es una rama y no un PR, y la
decoración no se ejecuta — sin error, simplemente no aparece el comentario.

## Cómo recomendar esto

Cuando alguien quiere análisis de PR con Community, el orden honesto es:

1. **SonarQube for IDE**, siempre y desde el primer día. Coste cero, sin contrapartidas.
2. **Gate en CI sobre la rama principal**, con la definición de código nuevo bien puesta.
   No previene, pero mide y crea la presión para no empeorar.
3. Si el equipo necesita el veredicto en el PR y hay presupuesto, **Developer Edition es la
   respuesta correcta**, y decirlo es más útil que montar un apaño.
4. Si no hay presupuesto y el PR es un requisito firme, **el plugin**, con la dependencia de
   versiones y el riesgo de migración explicados y aceptados por escrito. No es una decisión
   para tomar por el usuario.

## Fuentes

- [Ramas en SonarQube Server](https://docs.sonarsource.com/sonarqube-server/latest/analyzing-source-code/setting-up-the-branch-analysis)
  — lo que ofrece la edición de pago.
- [sonarqube-community-branch-plugin](https://github.com/mc1arke/sonarqube-community-branch-plugin)
- [Connected mode](https://docs.sonarsource.com/sonarqube-community-build/user-guide/connected-mode)
