# Plan F03: Baseline de tests del frontend + consolidar el contrato API duplicado

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 80416b7..HEAD -- src/app/shared/ src/app/core/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (idealmente antes de F01/F02 para que sus specs tengan dónde vivir)
- **Category**: tests | tech-debt
- **Planned at**: commit `80416b7`, 2026-06-11

## Why this matters

El frontend tiene ~30 pantallas CRUD y exactamente un spec (`app.spec.ts`); Karma/Jasmine están
configurados pero sin suite, cualquier refactor (como F01, que toca el interceptor de TODA la app)
se verifica a mano. Además el contrato HTTP está duplicado: `shared/models/api.model.ts` define
`ApiResponse`/`PageResponse`/`Pageable` (el contrato correcto, usado por los services de features),
mientras `shared/utils/responde.models.ts` (typo incluido) define un `ResponseModel` paralelo que
usa `AuthService`, y `shared/utils/response-table.model.ts` es un modelo estilo Spring Page que el
propio comentario de `api.model.ts` declara NO aplicable a este backend. Dos contratos para la misma
respuesta = divergencia silenciosa el día que uno cambie. Tras este plan: una suite mínima que corre
en headless y un único contrato API.

## Current state

- `src/app/shared/models/api.model.ts` — contrato canónico:
  `ApiResponse<T> { status, message, error, data }`, `PageResponse<T> { content, page, rows, total }`,
  `Pageable { page, rows, search?, order_by?, order? }`. Usado por los services de features
  (exemplar: `features/compras/orden-compra/services/orden-compra.service.ts`).
- `src/app/shared/utils/responde.models.ts` — `ResponseModel` duplicado (mismo shape); lo importan
  `core/services/auth.service.ts` (líneas 6, 22–28) y posiblemente otros — verifica con
  `grep -rn "responde.models" src/`.
- `src/app/shared/utils/response-table.model.ts` — modelo estilo Spring Page, no aplica al backend.
  Verifica usos con `grep -rn "response-table.model" src/` antes de decidir si se elimina.
- `src/app.spec.ts` no existe; el único spec es `src/app/app.spec.ts`.
- Test runner: Karma + Jasmine (`npx ng test`), ya en `package.json` (`"test": "ng test"`),
  `tsconfig.spec.json` presente. No hay configuración de CI ni ESLint en el repo.
- Auth core (lo que más vale la pena testear primero): `core/services/auth.service.ts` (signals +
  persistencia vía `core/services/index-db.service.ts` con localforage) y
  `core/interceptors/auth.interceptor.ts`.

## Commands you will need

| Purpose   | Command                                                  | Expected on success |
|-----------|----------------------------------------------------------|---------------------|
| Typecheck | `npx tsc --noEmit -p tsconfig.app.json`                  | exit 0              |
| Tests     | `npx ng test --watch=false --browsers=ChromeHeadless`    | exit 0, todas pasan |
| Build     | `npx ng build --configuration development`               | exit 0              |

Ejecutar desde `D:\Proyectos Camilo\erp_camilo\nyxora_erp_frontend`. Si ChromeHeadless no está
disponible en la máquina, STOP y reporta (no instales navegadores globales).

## Scope

**In scope**:
- `src/app/shared/utils/responde.models.ts` (eliminar tras migrar imports)
- `src/app/shared/utils/response-table.model.ts` (eliminar solo si grep confirma cero usos; si tiene
  usos, déjalo y anótalo en Maintenance notes)
- `src/app/core/services/auth.service.ts` (cambiar import a `api.model.ts`)
- Cualquier otro archivo que importe `responde.models` (solo el import)
- Specs nuevos: `core/services/auth.service.spec.ts`, `core/guards/auth.guard.spec.ts`,
  `shared/utils/*.spec.ts` si aplica
- `.github/workflows/ci.yml` (crear — opcional, ver Step 4)

**Out of scope**:
- Lógica de ningún service/componente (esto es tests + consolidación de tipos, cero cambios de comportamiento).
- El interceptor (sus specs llegan con F01 para no chocar).
- Añadir ESLint (vale la pena, pero es decisión de tooling aparte — anotada en plans/README.md).

## Git workflow

- Branch: `advisor/F03-baseline-tests`
- Commits estilo `test: ...` / `refactor: ...` en español; no push/PR sin instrucción.

## Steps

### Step 1: Consolidar el contrato API

1. `grep -rn "responde.models" src/` — lista los importadores.
2. En cada uno, reemplaza `ResponseModel` por `ApiResponse` de `shared/models/api.model.ts`
   (mismo shape; es un rename de tipo).
3. Elimina `shared/utils/responde.models.ts`.
4. `grep -rn "response-table.model" src/` — si cero usos, elimínalo también; si hay usos, déjalo.

**Verify**: `npx tsc --noEmit -p tsconfig.app.json` → exit 0 y
`grep -rn "ResponseModel" src/` → sin matches.

### Step 2: Specs del núcleo de auth

`core/services/auth.service.spec.ts` con TestBed + `provideHttpClientTesting()`:
- `login()` hace POST a `auth/login` y devuelve el `ApiResponse<TokenResponse>` mockeado.
- `persist()` actualiza el signal `session` y `isAuthenticated` pasa a `true`
  (mockea `IndexDbService` con un stub en memoria: `{ saveSession: async () => {}, loadSession: async () => session, clear: async () => {} }` provisto vía `{ provide: IndexDbService, useValue: stub }`).
- `logout()` limpia el signal.
- `hasPermiso('X')` true/false según `permisos` de la sesión.

`core/guards/auth.guard.spec.ts` con `TestBed.runInInjectionContext`:
- con token en el stub de IndexDb → `true`; sin token → UrlTree a `/login`.

**Verify**: `npx ng test --watch=false --browsers=ChromeHeadless` → exit 0, ≥6 specs pasan.

### Step 3: Spec de un util puro

Elige un util con lógica real (`shared/utils/date.utils.ts` o las funciones `findNavTitle`/`findNavGroup`
de `layout/sidebar/sidebar.menu.ts`) y cúbrelo con 3–5 casos (incluye un caso borde: URL con query
string para `findNavTitle`, fecha inválida para date.utils — según el que elijas).

**Verify**: `npx ng test --watch=false --browsers=ChromeHeadless` → exit 0.

### Step 4 (opcional, recomendado): CI mínima

`.github/workflows/ci.yml`: en push/PR a `main`, `npm ci` + typecheck + 
`npx ng test --watch=false --browsers=ChromeHeadless` + build dev. Usa `actions/setup-node@v4` con
Node 20 y cache npm. Si el operador no quiere CI aún, omite y anótalo en la fila del plan.

**Verify**: el YAML parsea (`npx js-yaml .github/workflows/ci.yml` o revisión manual de indentación).

## Test plan

Este plan ES el test plan del repo. Resultado esperado: suite con ~10+ specs verdes en headless,
cubriendo auth.service, auth.guard y un util, más el contrato API unificado que F01/F02 extenderán.

## Done criteria

- [ ] `npx tsc --noEmit -p tsconfig.app.json` exit 0
- [ ] `npx ng test --watch=false --browsers=ChromeHeadless` exit 0 con ≥10 specs
- [ ] `grep -rn "ResponseModel\|responde.models" src/` sin matches
- [ ] `npx ng build --configuration development` exit 0
- [ ] Solo archivos in-scope modificados (`git status`)
- [ ] Fila F03 actualizada en `plans/README.md`

## STOP conditions

- ChromeHeadless no disponible y no hay alternativa ya instalada (no instales software global).
- `ResponseModel` y `ApiResponse` NO tienen el mismo shape al compararlos (drift del contrato).
- `response-table.model.ts` tiene usos activos en componentes de tabla: déjalo, repórtalo, sigue.
- Más de 10 archivos importan `responde.models` (el alcance era mayor al estimado — reporta antes de seguir).

## Maintenance notes

- F01 y F02 añaden sus specs sobre esta base; ejecútalos después si es posible.
- Pendiente de tooling (decisión aparte, no de este plan): ESLint + angular-eslint, y Prettier check
  en CI. El repo ya trae config de Prettier en `package.json`.
- Limpieza menor detectada en la auditoría: existe un `.claude/settings.local.json` extraviado en
  `src/app/features/compras/` — eliminarlo cuando se toque ese módulo (no es de este plan).
