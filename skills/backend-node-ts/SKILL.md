---
name: backend-node-ts
description: Estándares para APIs y servicios backend en Node.js con TypeScript (estructura por capas, validación de entrada, manejo de errores, autenticación, logging, configuración, testing). Úsala cuando el usuario pida crear, revisar o refactorizar un backend en Node, mencione "express", "fastify", "hono", "nest", "api rest", "endpoint", "middleware", "jwt", "zod", o trabaje en un proyecto Node con TypeScript. Para el consumo de esa API desde el navegador, usa la skill de frontend correspondiente.
---

# Backend Node.js + TypeScript

Actúa como backend senior. Una API es un contrato: lo que la hace buena es que sea
predecible — mismos errores con la misma forma, misma validación en todas partes,
mismos nombres para las mismas cosas.

## Cómo entregas

1. Estructura de archivos.
2. Código por archivo.
3. Decisiones no obvias y su porqué.
4. Qué cambiarías al escalar.

## Capas

Tres, con una dirección de dependencia única:

- **Ruta / controlador** — traduce HTTP a llamadas de dominio. Lee la petición, valida,
  llama al servicio, formatea la respuesta. No tiene lógica de negocio.
- **Servicio** — la lógica de negocio. No sabe qué es HTTP: ni `req`, ni `res`, ni
  códigos de estado. Esta restricción es lo que te permite reutilizarlo desde un cron,
  una cola o un test.
- **Repositorio** — acceso a datos. Es lo único que conoce el ORM o el SQL.

Organiza las carpetas por funcionalidad, no por capa: `users/` con su ruta, servicio,
repositorio y tipos. Cuando cambias algo de usuarios, tocas una carpeta.

## Validar la entrada

**Todo lo que viene de fuera se valida en el borde**: body, query, params, cabeceras,
variables de entorno, respuestas de APIs de terceros. Con Zod o equivalente, y derivando
el tipo del esquema para no mantener dos definiciones.

```ts
const CreateUserSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(18),
});

type CreateUser = z.infer<typeof CreateUserSchema>;
```

El tipo de TypeScript desaparece en tiempo de ejecución; el esquema no. Un `as
CreateUser` sobre un body sin validar es una mentira al compilador.

**Valida también la configuración al arrancar.** Un servicio que arranca con una
variable de entorno ausente y falla tres horas después en producción es peor que uno
que no arranca.

## Errores

Define errores de dominio y tradúcelos a HTTP en un único middleware. Lanzar
`res.status(404)` desde un servicio mezcla capas y te obliga a duplicar el formato.

```ts
export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} ${id} no encontrado`);
    this.name = 'NotFoundError';
  }
}
```

El manejador central mapea el tipo de error al código y da **una sola forma de respuesta
de error** para toda la API. Un cliente que tiene que manejar tres formatos distintos
acabará ignorándolos.

Nunca filtres detalles internos al cliente: el stack trace va al log, no a la respuesta.

Códigos que se confunden a menudo:
- **400** entrada malformada · **422** bien formada pero inválida por reglas de negocio
- **401** no sé quién eres · **403** sé quién eres y no puedes
- **404** no existe · **409** conflicto de estado (duplicado, versión obsoleta)

## Async

`async/await` siempre, nunca callbacks. Y **nunca un `async` sin `try/catch` o sin un
manejador que lo capture**: una promesa rechazada sin capturar tumba el proceso.

Usa `Promise.all` para operaciones independientes. Encadenar `await` secuenciales sobre
llamadas que no dependen entre sí multiplica la latencia sin motivo.

```ts
// Secuencial sin necesidad: suma las tres latencias
const user = await getUser(id);
const orders = await getOrders(id);
const prefs = await getPrefs(id);

// Paralelo: la latencia es la de la más lenta
const [user, orders, prefs] = await Promise.all([
  getUser(id), getOrders(id), getPrefs(id),
]);
```

## Logging

Logs estructurados en JSON (pino, o equivalente), nunca `console.log` en producción:
un log en texto plano no se puede consultar.

Incluye un identificador de correlación por petición y propágalo a los servicios que
llames. Sin él, depurar un fallo intermitente es imposible.

**Nunca registres** contraseñas, tokens, cabeceras de autorización, datos personales ni
números de tarjeta. Si el objeto de log viene de una petición, redáctalo explícitamente
en lugar de confiar en que no contenga nada sensible.

## Seguridad

- Contraseñas con `argon2` o `bcrypt`. Nunca SHA ni MD5: son rápidos, y esa es
  exactamente la propiedad que no quieres aquí.
- Consultas parametrizadas siempre. Concatenar SQL con datos de usuario es inyección.
- Límite de tamaño en el body y rate limiting en los endpoints de autenticación.
- CORS explícito por origen. `*` en una API con credenciales es un fallo, no un atajo.
- Secretos por variable de entorno, nunca en el repositorio.

## Testing

Prioriza tests de integración sobre la API real: prueban lo que de verdad usa el
cliente. Los tests unitarios se reservan para lógica con muchas ramas.

Usa una base de datos real en los tests (contenedor efímero), no un mock del ORM. Un
mock del ORM verifica que llamaste a un método; no verifica que la consulta funcione.
