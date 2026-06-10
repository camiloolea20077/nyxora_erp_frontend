# Regla 00 — Convenciones de frontend (Angular 20 + signals)

**Stack:** Angular 20 (standalone) · signals · PrimeNG 20 · Tailwind 4 · TS 5.9 strict · RxJS 7.

## Reactividad con signals (no negociable)
- Estado del componente con **`signal()` / `computed()`**; nada de campos mutables sueltos para estado de UI.
  ```ts
  readonly rows = signal<XxxTableModel[]>([]);
  readonly loading = signal(false);
  readonly total = signal(0);
  readonly search = signal('');
  readonly hayDatos = computed(() => this.rows().length > 0);
  ```
- **Inputs/outputs con la API de signals:** `input()`, `input.required()`, `output()`, `model()` (two-way).
  ```ts
  readonly visible = model(false);              // [(visible)]
  readonly registro = input<XxxModel | null>(null);
  readonly saved = output<void>();
  ```
- Queries con `viewChild()` / `viewChildren()` (signals), no `@ViewChild` decorador.
- `effect()` solo para efectos secundarios (logging, sync con DOM). No para derivar estado (eso es `computed`).
- Interop RxJS: `toSignal(obs$)` para consumir streams; `toObservable(sig)` si necesitas un stream.

## Change detection
- El proyecto es **zoneless** (sin zone.js): `app.config.ts` usa `provideZonelessChangeDetection()`.
  El refresco de la vista depende de **signals** (y async pipe / eventos). Nada de `setTimeout` para "forzar" CD.
- **`ChangeDetectionStrategy.OnPush` SIEMPRE.** Con signals, los cambios marcan el componente solos:
  **NO se usa `cdr.markForCheck()`** (ese patrón era de la era pre-signals). Si un dato no se refleja,
  es que no está en un signal — conviértelo en signal, no metas `markForCheck`.

## Nomenclatura de archivos — OBLIGATORIO (sufijo de tipo en TODOS)
- **Componentes con sufijo `.component`:** `nombre.component.ts` · `nombre.component.html` · `nombre.component.css`
  (p. ej. `login.component.ts`, `index-marca.component.ts`). **Clase con sufijo `Component`**
  (`export class LoginComponent`, `export class IndexMarcaComponent`); selector `app-login`, `app-index-marca`.
- Servicios/guards/interceptors/modelos/rutas con su sufijo: `auth.service.ts`, `auth.guard.ts`,
  `auth.interceptor.ts`, `<modulo>.model.ts`, `<modulo>.routes.ts`.
- Regla: **cada archivo lleva su tipo en el nombre.** NUNCA `login.ts` para un componente — siempre `login.component.ts`.
- Aplica a **todos** los archivos que se creen de ahora en adelante.

## Inyección
- **`inject()`** en vez de inyección por constructor:
  ```ts
  private readonly service = inject(XxxService);
  private readonly alert = inject(AlertService);
  ```

## Control flow nativo (no directivas estructurales)
- Usar **`@if` / `@else` / `@for` / `@switch`**. PROHIBIDO `*ngIf`, `*ngFor`, `*ngSwitch`.
- En `@for` el **`track` es obligatorio**: `@for (l of lineas(); track l._id) { … }`.

## Tipado estricto — CERO `any`
- **Prohibido `any`** (y `as any`). Si no tienes el tipo, créalo (modelos por módulo / agente contrato-api).
- Respuestas HTTP siempre genéricas: `http.post<ApiResponse<XxxModel>>(...)`. Nunca `Observable<any>`.
- Usa `unknown` + narrowing si de verdad es desconocido; tipa los `catch (e: unknown)`.
- Aprovecha el `tsconfig` strict del proyecto (strictTemplates, noImplicitOverride, etc.). No lo relajes.

## Asíncronía y errores
- Llamadas HTTP con `lastValueFrom(...)` dentro de `async/await`, en **`try/catch/finally`**.
- En `finally`: `this.loading.set(false)` (sin `markForCheck`).
- Errores al usuario con `AlertService` (mensaje en **español**); el interceptor maneja 401 global.

## Estilo
- Prettier del proyecto: comillas simples, `printWidth: 100`. Métodos y variables en **inglés camelCase**;
  textos visibles y mensajes en **español**. Moneda con helper `formatCOP` (ver regla 03).
