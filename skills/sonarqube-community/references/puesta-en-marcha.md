# Puesta en marcha

> Última revisión: 2026-09-28. Contiene versiones de imágenes y del scanner, que caducan.
> Antes de modificarlas, consulta
> [la documentación de Community Build](https://docs.sonarsource.com/sonarqube-community-build/)
> y actualiza esta fecha.

Dos escenarios. Decide primero cuál es, porque el trabajo es distinto: con servidor
compartido no hay nada que instalar.

| | Docker local | Servidor compartido |
|---|---|---|
| Cuándo | Probar la herramienta, un proyecto personal, CI efímero | Ya existe una instancia del equipo |
| Coste | ~2 GB de RAM mientras corre | Ninguno en tu máquina |
| Historial | Se pierde al borrar los volúmenes | Persistente y visible por todos |
| Riesgo | Ninguno | Escribes en un proyecto que ve el equipo — **avisa antes** |

## Versionado: no busques la versión "LTS"

Community Build usa versionado por calendario, `YY.M.0.BuildNumber` (por ejemplo
`26.9.0.129388`), con lanzamientos frecuentes. **Desde `24.12` no hay correspondencia
alguna entre las versiones de Community Build y las de SonarQube Server**, el producto
comercial, que sí tiene releases LTA. Buscar "la LTS de Community" no lleva a ninguna
parte, y mezclar documentación de las dos líneas es la causa habitual de que una propiedad
no exista donde la documentación dice.

Consecuencia práctica: **fija la etiqueta de la imagen**. `sonarqube:community` es alias de
`latest` y se mueve; un `docker compose pull` puede traerte una versión mayor sin que lo
pidas.

## Servidor compartido: lo único que hace falta

Nada de instalación. Solo el token y la URL:

```bash
export SONAR_HOST_URL="https://sonar.miempresa.com"
export SONAR_TOKEN="<token>"
```

El token se genera en **My Account → Security** y se elige el tipo:

- **Project Analysis Token** — atado a un proyecto. Es el que va en CI: si se filtra, el
  alcance del daño está limitado a ese proyecto.
- **Global Analysis Token** — sirve para crear proyectos nuevos al analizar. Cómodo y
  peligroso; úsalo solo si de verdad hace falta.
- **User Token** — actúa como la persona, con todos sus permisos. **No va en CI nunca.**

## Docker local

En Linux hace falta subir un límite del kernel antes de arrancar, porque Elasticsearch va
dentro del contenedor y no arranca sin él:

```bash
sudo sysctl -w vm.max_map_count=524288
# Para que persista tras reiniciar, añádelo a /etc/sysctl.conf
```

En Docker Desktop (Windows y macOS) lo aplica la VM y no hay que tocar nada.

### Un solo contenedor, solo para probar

```bash
docker run --name sonarqube -p 9000:9000 sonarqube:26.9.0.129388-community
```

Usa una base de datos H2 embebida. **Sirve para una prueba de diez minutos y para nada
más:** no se puede actualizar de versión, no se puede respaldar y la documentación oficial
la descarta para cualquier uso real. Sin volúmenes, todo desaparece con el contenedor.

### Con PostgreSQL, para uso continuado

`docker-compose.yml`:

```yaml
services:
  sonarqube:
    image: sonarqube:26.9.0.129388-community
    depends_on: [db]
    ports: ["9000:9000"]
    environment:
      SONAR_JDBC_URL: jdbc:postgresql://db:5432/sonarqube
      SONAR_JDBC_USERNAME: sonar
      SONAR_JDBC_PASSWORD: ${SONAR_DB_PASSWORD}
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_logs:/opt/sonarqube/logs

  db:
    image: postgres:17
    environment:
      POSTGRES_DB: sonarqube
      POSTGRES_USER: sonar
      POSTGRES_PASSWORD: ${SONAR_DB_PASSWORD}
    volumes:
      - postgresql_data:/var/lib/postgresql/data

volumes:
  sonarqube_data:
  sonarqube_extensions:
  sonarqube_logs:
  postgresql_data:
```

Los tres volúmenes de SonarQube no son opcionales: `data` contiene el índice de
Elasticsearch —sin él el arranque siguiente lo reconstruye entero— y `extensions` los
plugins instalados, que de otro modo hay que reinstalar a mano.

**`SONAR_DB_PASSWORD` va en un `.env` no versionado**, no escrita en el compose. Y el
compose no publica el puerto de PostgreSQL: solo lo necesita el contenedor de SonarQube.

```bash
docker compose up -d
docker compose logs -f sonarqube   # espera "SonarQube is operational"
```

El arranque tarda entre uno y tres minutos. Antes de ese mensaje, `localhost:9000` responde
con un error o no responde; no es un fallo de instalación.

Después: `http://localhost:9000`, `admin` / `admin`, y obliga a cambiar la contraseña en el
primer acceso. **Una instancia con `admin`/`admin` accesible desde la red es un problema
real**, no una formalidad: da acceso de lectura a todo el código indexado.

Solo una instancia puede conectarse a un esquema de base de datos a la vez. Dos
contenedores contra el mismo PostgreSQL corrompen el índice.

## Primer análisis

Crea el proyecto en la interfaz (**Create Project → Local**), que te da la clave y ofrece
generar el token.

El scanner CLI —versión 8.1, publicada el 2026-04-21— vía Docker, sin instalar nada:

```bash
docker run --rm \
  -e SONAR_HOST_URL="http://host.docker.internal:9000" \
  -e SONAR_TOKEN="$SONAR_TOKEN" \
  -v "$(pwd):/usr/src" \
  sonarsource/sonar-scanner-cli
```

`host.docker.internal` es lo que permite al contenedor del scanner alcanzar el servidor del
host. En Linux, o usas `--network` para ponerlos en la misma red, o
`--add-host=host.docker.internal:host-gateway`. Si el scanner responde *connection refused*
contra `localhost:9000`, esto es la causa el 90 % de las veces: `localhost` dentro del
contenedor es el propio contenedor.

Instalado en local, es lo mismo sin Docker:

```bash
sonar-scanner
```

Toma la configuración de `sonar-project.properties` y el resto del entorno.

## CI

Lo que aporta el CI es el **quality gate como puerta**: sin `-Dsonar.qualitygate.wait=true`
el paso termina en verde en cuanto el análisis se envía, sin esperar el veredicto, y el gate
queda como un adorno en un panel que nadie abre.

GitHub Actions:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0   # sin el historial completo, el blame y el "código nuevo" salen mal

- uses: sonarsource/sonarqube-scan-action@v5
  env:
    SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
  with:
    args: -Dsonar.qualitygate.wait=true
```

`fetch-depth: 0` importa más de lo que parece. Con el checkout superficial que hace Actions
por defecto, SonarQube no puede atribuir las líneas a sus autores ni fechas, y el cálculo de
código nuevo —de lo que depende todo el gate— queda mal.

En Community, y salvo que montes una de las estrategias de
[`ramas-y-prs.md`](ramas-y-prs.md), este workflow **solo debe dispararse en la rama
principal**. Lanzarlo en cada PR hace que todas las ramas escriban sobre el mismo proyecto,
y el historial queda mezclado y sin sentido.

## SonarQube for IDE

La extensión de editor (VS Code, IntelliJ, Visual Studio, Eclipse), gratuita, antes llamada
SonarLint. En *connected mode* se vincula al proyecto del servidor y aplica **sus** reglas y
**su** quality profile en el editor.

En Community Build no es un complemento opcional: es la única forma soportada de ver un
problema antes del merge. Un issue detectado mientras escribes cuesta segundos; el mismo
issue detectado en la rama principal cuesta una rama, un PR y una revisión.

## Fuentes

- [Documentación de SonarQube Community Build](https://docs.sonarsource.com/sonarqube-community-build/)
- [Instalación desde imagen Docker](https://docs.sonarsource.com/sonarqube-community-build/server-installation/from-docker-image)
- [SonarScanner CLI](https://docs.sonarsource.com/sonarqube-community-build/analyzing-source-code/scanners/sonarscanner)
- [Imagen oficial en Docker Hub](https://hub.docker.com/_/sonarqube)
- [Connected mode](https://docs.sonarsource.com/sonarqube-community-build/user-guide/connected-mode)
