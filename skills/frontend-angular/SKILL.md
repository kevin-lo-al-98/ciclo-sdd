---
name: frontend-angular
description: Estándares para Angular moderno (standalone components, signals, control flow @if/@for, inject(), RxJS, formularios reactivos, lazy loading). Úsala cuando el usuario pida crear, revisar o refactorizar código Angular, mencione "angular", "componente standalone", "signal", "rxjs", "observable", "ngmodule", "formulario reactivo", o trabaje en un proyecto con angular.json. No la uses para React, Astro o Vanilla JS.
---

# Angular moderno

Actúa como frontend senior en Angular. "Moderno" aquí significa concreto: componentes
standalone, signals para el estado, la nueva sintaxis de control de flujo e `inject()`
en lugar de inyección por constructor.

## Cómo entregas

1. Estructura de archivos.
2. Código por archivo.
3. Decisiones no obvias y su porqué.
4. Qué cambiarías al escalar.

## Standalone por defecto

No crees `NgModule` nuevos. Los componentes, directivas y pipes se declaran standalone
y se importan donde se usan. El módulo dejó de ser la unidad de organización, y
mantenerlo obliga a declarar cada cosa en dos sitios.

```ts
@Component({
  selector: 'app-user-list',
  imports: [UserCardComponent],
  template: `...`,
})
export class UserListComponent {}
```

`standalone: true` ya es el valor por defecto; no hace falta escribirlo.

## Signals para el estado

Los signals son la forma por defecto de manejar estado. Frente a RxJS para estado
síncrono son más simples: sin suscripciones que limpiar, sin `async` pipe, sin
`ChangeDetectorRef`.

```ts
export class CartComponent {
  private readonly items = signal<CartItem[]>([]);

  readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.qty, 0)
  );

  add(item: CartItem) {
    this.items.update((current) => [...current, item]);
  }
}
```

Reglas prácticas:

- `signal()` para estado que cambia; `computed()` para todo lo derivado.
- **Nunca guardes en un signal lo que puedes derivar con `computed()`.** Dos fuentes
  de verdad para el mismo dato acaban desincronizándose.
- `effect()` solo para efectos externos (logging, `localStorage`, APIs del navegador).
  No lo uses para actualizar otro signal: eso es un `computed`.
- Expón los signals como `readonly` y muta a través de métodos. Un signal público y
  escribible es un campo público mutable.

## Dónde sigue teniendo sentido RxJS

Signals no sustituyen a RxJS. RxJS sigue siendo lo correcto para flujos asíncronos con
tiempo: `debounceTime` en una búsqueda, `switchMap` para cancelar peticiones obsoletas,
combinar varios eventos, reintentos.

La regla: **RxJS para el flujo, signal para el estado resultante.** Convierte al final
con `toSignal()`.

```ts
readonly results = toSignal(
  this.search$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((term) => this.api.search(term)),
  ),
  { initialValue: [] },
);
```

`switchMap` ahí no es un detalle: cancela la petición anterior y evita que una respuesta
lenta pise a una más reciente.

## Control de flujo en plantillas

Usa `@if`, `@for` y `@switch`. No `*ngIf` ni `*ngFor`.

```html
@if (user(); as u) {
  <app-profile [user]="u" />
} @else {
  <app-login-prompt />
}

@for (item of items(); track item.id) {
  <app-item [data]="item" />
} @empty {
  <p>No hay elementos.</p>
}
```

`track` es obligatorio y debe ser un identificador estable. Usar el índice en una lista
que se reordena hace que Angular recree el DOM equivocado.

`@empty` te da el estado vacío gratis; úsalo en lugar de un `@if` aparte.

## Inyección

Usa `inject()` en lugar del constructor. Es más corto, funciona en funciones y
compone mejor con la herencia.

```ts
export class UserService {
  private readonly http = inject(HttpClient);
}
```

## Formularios

Reactivos, no template-driven. Tipa el formulario:

```ts
readonly form = inject(FormBuilder).nonNullable.group({
  email: ['', [Validators.required, Validators.email]],
  age: [0, [Validators.min(18)]],
});
```

`nonNullable` evita el `| null` en cada valor. Los validadores personalizados van en
su propio archivo, no como funciones anónimas dentro del componente.

## Estructura y carga

Organiza por funcionalidad, no por tipo de archivo. Una carpeta `users/` con su
componente, servicio y tipos se entiende mejor que `components/`, `services/` y
`models/` repartidos.

Las rutas se cargan con `loadComponent` / `loadChildren`. Cada ruta cargada de forma
diferida es peso que no paga quien no visita esa pantalla.

## Detección de cambios

`ChangeDetectionStrategy.OnPush` en todos los componentes. Con signals es coherente:
el componente se actualiza cuando cambia un signal que lee, no en cada evento global.
