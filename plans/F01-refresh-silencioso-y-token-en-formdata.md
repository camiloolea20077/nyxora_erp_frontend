# Plan F01: Usar el refresh token (sesión que no se cae) y adjuntar el JWT también en requests FormData

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 80416b7..HEAD -- src/app/core/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (toca el flujo de autenticación de toda la app)
- **Depends on**: none (pero coordina con el plan 002 del backend — ver Maintenance notes)
- **Category**: bug | security
- **Planned at**: commit `80416b7`, 2026-06-11

## Why this matters

El backend emite un `accessToken` de vida corta y un `refreshToken` de 7 días, y expone
`POST /api/auth/refresh`. El frontend guarda ambos pero **nunca llama a refresh**: cuando el access
token expira, el interceptor recibe 401, borra la sesión y patea al usuario al login. En la práctica
la sesión dura lo que dure el access token, y el refresh token es código muerto. Además, el
interceptor **omite el header `Authorization` cuando el body es `FormData`** (la condición que debía
evitar fijar `Content-Type` quita el token completo), así que cualquier upload de archivos a un
endpoint protegido devuelve 401 siempre. Tras este plan: las sesiones se renuevan en silencio, el
usuario solo vuelve al login cuando el refresh token expira o es rechazado, y los uploads van
autenticados.

## Current state

Archivos relevantes (todos bajo `src/app/core/`):

- `core/interceptors/auth.interceptor.ts` — añade el Bearer y maneja 401 con logout directo. El bug
  de FormData está en las líneas 19–22:

  ```ts
  const request =
    token && !(req.body instanceof FormData)
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}`, Accept: '*/*' } })
      : req;
  ```

  y el manejo 401 en las líneas 25–32: ante cualquier 401 hace `alert.error(...)`,
  `auth.logout()` y `router.navigate(['/login'])`, sin intentar refresh.

- `core/services/auth.service.ts` — tiene `refresh(req: RefreshRequest)` (líneas 26–28) que llama a
  `POST {apiUrl}auth/refresh`, y `persist(session)` (líneas 31–34) que guarda en IndexedDB y publica
  el signal. **Nadie llama a `refresh()` hoy** (verificado por grep).

- `core/services/index-db.service.ts` — persistencia con localforage; `getToken()` devuelve
  `accessToken`; no existe `getRefreshToken()` (añadirlo, es trivial: `(await this.loadSession())?.refreshToken ?? null`).

- `core/guards/auth.guard.ts` — solo verifica que exista un token en IndexedDB; un token expirado
  pasa el guard y revienta en la primera llamada HTTP. Queda igual en este plan (el interceptor con
  refresh lo cubre); no lo toques.

- `core/models/auth.model.ts` — `TokenResponse { accessToken, refreshToken, ..., permisos }` y
  `RefreshRequest { refreshToken }` (verifica el nombre exacto del campo en el archivo antes de usarlo).

Contrato backend (para que no tengas que mirarlo): `POST /api/auth/refresh` recibe
`{ refreshToken }` y responde `ApiResponse<TokenResponse>` con un nuevo par de tokens. Si el
refresh es inválido/expirado responde 401. La URL base sale de `environment.apiUrl`
(`http://localhost:8081/api/` en dev).

Convenciones del repo: interceptores funcionales (`HttpInterceptorFn`), `inject()` en lugar de
constructor, signals para estado, RxJS solo en el borde HTTP. Prettier 100 cols, single quote.

## Commands you will need

| Purpose   | Command                                        | Expected on success |
|-----------|------------------------------------------------|---------------------|
| Typecheck | `npx tsc --noEmit -p tsconfig.app.json`        | exit 0              |
| Build dev | `npx ng build --configuration development`     | exit 0              |
| Tests     | `npx ng test --watch=false --browsers=ChromeHeadless` | pass (si F03 ya corrió; si no hay specs, omitir) |

Ejecutar desde la raíz del repo frontend: `D:\Proyectos Camilo\erp_camilo\nyxora_erp_frontend`.

## Scope

**In scope** (únicos archivos a modificar):
- `src/app/core/interceptors/auth.interceptor.ts`
- `src/app/core/services/auth.service.ts`
- `src/app/core/services/index-db.service.ts`
- `src/app/core/models/auth.model.ts` (solo si falta algún tipo)

**Out of scope** (NO tocar aunque parezcan relacionados):
- `core/guards/auth.guard.ts` — la validación de expiración en el guard es mejora aparte.
- `features/auth/login/*` — el login ya persiste la sesión correctamente.
- Cualquier servicio de features — el interceptor es transversal, no se toca consumidor por consumidor.

## Git workflow

- Branch: `advisor/F01-refresh-silencioso`
- Commits estilo del repo (`feat: ...` / `fix: ...` en español, ver `git log`); uno por paso lógico.
- No hacer push ni abrir PR salvo instrucción del operador.

## Steps

### Step 1: Arreglar el header Authorization con FormData

En `auth.interceptor.ts`, separa las dos preocupaciones: el token SIEMPRE se adjunta si existe;
lo único condicionado a FormData es no forzar `Content-Type` (que hoy ni se fija, así que basta):

```ts
const request = token
  ? req.clone({ setHeaders: { Authorization: `Bearer ${token}`, Accept: '*/*' } })
  : req;
```

**Verify**: `npx tsc --noEmit -p tsconfig.app.json` → exit 0.

### Step 2: Exponer el refreshToken desde IndexedDB

En `index-db.service.ts` añade:

```ts
async getRefreshToken(): Promise<string | null> {
  return (await this.loadSession())?.refreshToken ?? null;
}
```

**Verify**: `npx tsc --noEmit -p tsconfig.app.json` → exit 0.

### Step 3: Refresh silencioso en el interceptor ante 401

Reescribe el `catchError` del interceptor con esta lógica (forma objetivo, adapta imports):

1. Si el error NO es 401, o la request que falló es la propia de `auth/login` o `auth/refresh`
   (compara con `req.url.includes('auth/login')` / `auth/refresh`), re-lanza como hoy.
2. Si es 401 en cualquier otra request: lee el refresh token (`db.getRefreshToken()`).
   - Si no hay refresh token → comportamiento actual (alert + logout + navigate a /login).
   - Si hay: llama `auth.refresh({ refreshToken })`, ante éxito `await auth.persist(res.data)`
     (usa `from(...)`/`switchMap` para integrarlo al pipe) y **reintenta la request original una
     sola vez** clonándola con el nuevo `accessToken`.
   - Si el refresh falla (cualquier error) → alert + logout + navigate a /login, re-lanza.
3. Evita tormenta de refresh con peticiones concurrentes: usa un `shareReplay(1)` sobre un
   observable de refresh compartido a nivel de módulo (variable module-scope
   `let refreshInFlight$: Observable<TokenResponse> | null`), que se limpia en `finalize`.
   Todas las requests que reciban 401 mientras hay un refresh en vuelo deben esperar ese mismo
   observable y reintentar con su resultado.

No reintentes más de una vez por request (sin contadores globales: si el reintento vuelve a dar
401, cae al logout).

**Verify**: `npx tsc --noEmit -p tsconfig.app.json` → exit 0 y
`npx ng build --configuration development` → exit 0.

### Step 4: Verificación manual mínima (si hay backend corriendo)

Solo si el backend está disponible en `http://localhost:8081`: inicia sesión, edita a mano en
DevTools → IndexedDB (`nyxora-erp/session`) el `accessToken` poniéndole un valor corrupto, navega a
cualquier listado y confirma que la app se recupera sola (hace refresh y la tabla carga) en lugar de
expulsarte al login. Si no hay backend disponible, deja constancia y pasa al test plan.

## Test plan

Si el plan F03 (baseline de tests) ya corrió, añade specs en
`src/app/core/interceptors/auth.interceptor.spec.ts` usando `HttpClientTestingModule`/`provideHttpClientTesting`:
- request con token → lleva header `Authorization`.
- request con body `FormData` y token → **también** lleva header (regresión del Step 1).
- 401 con refresh exitoso → se llama `auth/refresh` una vez y la request original se reintenta con el token nuevo.
- 401 con refresh fallido → se navega a `/login` y la sesión queda limpia.
- dos requests concurrentes con 401 → un solo POST a `auth/refresh`.

Si F03 no ha corrido aún, deja los specs escritos igualmente (Karma ya está configurado en el repo:
`npx ng test --watch=false --browsers=ChromeHeadless` debe pasar con tus specs).

## Done criteria

- [ ] `npx tsc --noEmit -p tsconfig.app.json` exit 0
- [ ] `npx ng build --configuration development` exit 0
- [ ] `grep -n "instanceof FormData" src/app/core/interceptors/auth.interceptor.ts` sin matches (o solo en comentario)
- [ ] `auth.service.ts#refresh` tiene al menos un llamador real (el interceptor)
- [ ] Ningún archivo fuera del scope modificado (`git status`)
- [ ] Fila de F01 actualizada en `plans/README.md`

## STOP conditions

- El código de `auth.interceptor.ts` no coincide con los excerpts (drift).
- `RefreshRequest` en `auth.model.ts` no tiene el campo `refreshToken` (contrato distinto al asumido).
- El backend responde algo distinto de `ApiResponse<TokenResponse>` en `/auth/refresh` (verifícalo
  contra `core/models/auth.model.ts` y, si hay dudas, contra el backend en
  `D:\Proyectos Camilo\erp_camilo\nyxora_erp\src\main\java\...\controller` — solo lectura).
- El build falla dos veces tras intento razonable de arreglo.

## Maintenance notes

- **Coordinar con el plan 002 del backend** (`nyxora_erp/plans/002-endurecer-jwt-tipo-token-y-refresh.md`):
  cuando el backend empiece a rechazar refresh-como-access, este flujo es lo que mantiene la UX
  intacta. Probar juntos al aterrizar ambos.
- Si más adelante se valida expiración en `auth.guard.ts` (decodificar `exp` del JWT), el refresh
  de este plan debe reutilizarse ahí en lugar de duplicarlo.
- Revisar en el PR: que el observable compartido de refresh se limpie en `finalize` (fuga si no) y
  que `auth/refresh` mismo esté excluido del reintento (loop infinito si no).
