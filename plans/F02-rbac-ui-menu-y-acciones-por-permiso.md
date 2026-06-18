# Plan F02: Aplicar RBAC en la UI — menú, rutas y acciones según los permisos del JWT

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 80416b7..HEAD -- src/app/core/ src/app/layout/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW (solo oculta/da acceso en cliente; la autoridad real es el backend)
- **Depends on**: plan 006 del backend (`nyxora_erp/plans/006-rbac-permisos-en-endpoints.md`) para
  que el control sea real; la parte de UI puede aterrizar antes sin riesgo.
- **Category**: security | dx
- **Planned at**: commit `80416b7`, 2026-06-11

## Why this matters

El backend siembra 19 permisos, los incluye en el JWT, y el frontend ya los expone
(`AuthService.permisos`, `hasPermiso(codigo)`) — pero **nadie los usa**: el sidebar muestra los 19
grupos de módulos a cualquier usuario y todas las acciones (crear, aprobar, anular, eliminar) están
visibles siempre. Cuando el backend aplique RBAC (su plan 006), el usuario sin permiso verá botones
que devuelven 403: pésima UX y señal de producto inmaduro. Este plan hace que el menú, las rutas y
las acciones respondan a los permisos reales del token. El RBAC de UI es cosmético (la seguridad
real es del backend), pero es lo que un evaluador de un ERP competitivo espera ver.

## Current state

- `src/app/core/services/auth.service.ts` — ya expone:
  ```ts
  readonly permisos = computed<string[]>(() => this._session()?.permisos ?? []);
  hasPermiso(codigo: string): boolean { return this.permisos().includes(codigo); }
  ```
  (líneas 20 y 46–48). Sin llamadores hoy.
- `src/app/layout/sidebar/sidebar.menu.ts` — `NAV_MENU: NavGroup[]` estático con TODOS los módulos
  (incluidos los que no tienen pantalla: nómina, académico, jurídico…). `NavItem { label, icon, route }`.
- `src/app/layout/sidebar/sidebar.component.ts` — renderiza `NAV_MENU`.
- `src/app/app.routes.ts` — todas las rutas hijas bajo un único `authGuard`; no hay guard por permiso.
- Los CÓDIGOS exactos de permiso viven en el backend: tabla `permiso`, sembrada en
  `D:\Proyectos Camilo\erp_camilo\nyxora_erp\src\main\resources\db\migration\V3__seed_nucleo.sql`
  (y posibles seeds posteriores — busca `INSERT INTO permiso` en `db/migration/*.sql`). LÉELOS de ahí;
  no inventes códigos. El JWT entrega esos mismos strings en `permisos: string[]`.

Convenciones: standalone components, signals/computed, `inject()`, guards funcionales
(`CanActivateFn`, ver `core/guards/auth.guard.ts` como exemplar). Prettier 100 cols, single quote.

## Commands you will need

| Purpose   | Command                                    | Expected on success |
|-----------|--------------------------------------------|---------------------|
| Typecheck | `npx tsc --noEmit -p tsconfig.app.json`    | exit 0              |
| Build dev | `npx ng build --configuration development` | exit 0              |

Ejecutar desde `D:\Proyectos Camilo\erp_camilo\nyxora_erp_frontend`.

## Scope

**In scope**:
- `src/app/layout/sidebar/sidebar.menu.ts` (añadir campo opcional `permiso?: string` a `NavItem`/`NavGroup`)
- `src/app/layout/sidebar/sidebar.component.ts` / `.html` (filtrar por permiso)
- `src/app/core/guards/permission.guard.ts` (crear)
- `src/app/app.routes.ts` (aplicar el guard con `data: { permiso }` en rutas que tengan permiso definido)

**Out of scope**:
- Backend (los permisos y su enforcement son del plan 006 del backend).
- Ocultar botones dentro de cada componente de feature (crear/aprobar/anular): déjalo documentado en
  Maintenance notes como patrón a seguir; hacerlo en las ~30 pantallas infla el riesgo de este plan.
  EXCEPCIÓN: hazlo en UNA pantalla como exemplar — `features/compras/orden-compra/index/…` (botones
  aprobar/anular) — para que el patrón quede demostrado.
- `auth.guard.ts` y el interceptor.

## Git workflow

- Branch: `advisor/F02-rbac-ui`
- Commits estilo `feat: ...` en español; no push/PR sin instrucción del operador.

## Steps

### Step 1: Mapear códigos de permiso reales

Lee `INSERT INTO permiso` en las migraciones del backend
(`nyxora_erp/src/main/resources/db/migration/`). Construye la tabla código→módulo (p. ej. permisos de
usuarios/roles → grupo "Administración"; compras → órdenes/recepciones; contabilidad → comprobantes…).
Si un módulo del menú no tiene permiso correspondiente (p. ej. módulos sin backend como Nómina),
déjalo SIN campo `permiso` — visible para todos, como hoy.

**Verify**: lista de códigos documentada en el commit message o en comentario del menu — y cero
códigos inventados (cada uno aparece textual en una migración).

### Step 2: Extender el modelo del menú y filtrar el sidebar

- Añade `permiso?: string` a `NavItem` (y opcionalmente a `NavGroup` para ocultar grupos completos).
- Anota los ítems con su permiso de LECTURA correspondiente según el Step 1.
- En `sidebar.component.ts`, expón un `computed` que filtre `NAV_MENU`:
  ítem visible si no declara `permiso` o si `auth.hasPermiso(item.permiso)`; grupo visible si le
  queda al menos un ítem. Renderiza el menú filtrado en el template.

**Verify**: `npx ng build --configuration development` → exit 0.

### Step 3: Guard por permiso en rutas

Crea `core/guards/permission.guard.ts` (funcional, modelado sobre `auth.guard.ts`):

```ts
export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const permiso = route.data['permiso'] as string | undefined;
  return !permiso || auth.hasPermiso(permiso) ? true : router.createUrlTree(['/dashboard']);
};
```

En `app.routes.ts`, a cada ruta de módulo que tenga permiso mapeado en el Step 1 añádele
`canActivate: [permissionGuard], data: { permiso: '<codigo>' }` (el `authGuard` padre ya cubre la
autenticación). Rutas sin permiso mapeado quedan como están.

**Verify**: `npx tsc --noEmit -p tsconfig.app.json` → exit 0.

### Step 4: Exemplar de acciones por permiso

En `features/compras/orden-compra/index/index-orden-compra.component.ts`/`.html`, condiciona los
botones de aprobar/anular al permiso correspondiente (inyecta `AuthService`, usa
`auth.hasPermiso(...)` en un `computed` o directamente en el template con `@if`). Mantén el estilo
del componente existente.

**Verify**: `npx ng build --configuration development` → exit 0.

## Test plan

Specs nuevas (Karma ya configurado; correr con `npx ng test --watch=false --browsers=ChromeHeadless`):
- `permission.guard.spec.ts`: con permiso → `true`; sin permiso → UrlTree a `/dashboard`; ruta sin
  `data.permiso` → `true`. Mockea `AuthService` con un objeto `{ hasPermiso: () => ... }`.
- Sidebar: el computed de filtrado oculta ítems cuyo permiso no está en la sesión (test del
  componente o extrae la función de filtrado pura a `sidebar.menu.ts` y testéala directo — preferido).

## Done criteria

- [ ] `npx tsc --noEmit -p tsconfig.app.json` exit 0
- [ ] `npx ng build --configuration development` exit 0
- [ ] `grep -rn "hasPermiso" src/app/layout src/app/core/guards` devuelve ≥2 usos reales
- [ ] Cada código de permiso usado existe textual en una migración del backend (`grep` en `db/migration`)
- [ ] Specs del guard pasan
- [ ] Fila F02 actualizada en `plans/README.md`

## STOP conditions

- No encuentras `INSERT INTO permiso` en las migraciones del backend (el seed cambió de lugar).
- Los permisos del JWT no son strings planos que coinciden con los códigos sembrados (p. ej. llegan
  con prefijo `ROLE_`): reporta el formato real antes de mapear.
- El sidebar usa otra fuente de menú distinta de `NAV_MENU` (drift).

## Maintenance notes

- Patrón para las demás pantallas (seguir el exemplar de orden-compra): inyectar `AuthService` y
  condicionar botones mutadores con `auth.hasPermiso('<codigo>')`. Extender pantalla por pantalla
  cuando se toque cada módulo, no en un big-bang.
- Cuando el backend agregue permisos nuevos (facturación/cartera vendrán con sus planes 007/008),
  anotar los ítems nuevos del menú con su código.
- Recordar siempre: esto es UX, no seguridad. La autoridad es el backend (plan 006).
