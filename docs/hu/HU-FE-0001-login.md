# HU-FE-0001 — Inicio de sesión

| Campo | Valor |
|---|---|
| **Código** | HU-FE-0001 |
| **Módulo** | Auth |
| **Estado** | En desarrollo |
| **HU backend** | HU-0001 (`../nyxora_erp/docs/hu/HU-0001-autenticacion-login.md`) |
| **Endpoints** | `POST /api/auth/login`, `POST /api/auth/refresh` |

## Historia
> **Como** usuario del ERP
> **quiero** iniciar sesión con usuario y contraseña
> **para** acceder a la aplicación con mi sesión y permisos.

## Pantallas / componentes
- `features/auth/login/login` — pantalla split (marca + formulario). Sin dialog (es página pública).
- Tras login exitoso → `/dashboard`. Rutas protegidas con `authGuard`.

## Diseño (skill interface-design)
- Ver `docs/ui/login.md` (split full-screen, estados cargando/error/éxito, responsive).

## Contrato de datos
- Request: `LoginRequest { username, password }`.
- Respuesta: `ApiResponse<TokenResponse>` con `{ accessToken, refreshToken, tokenType, expiresIn,
  usuarioId, username, empresaId, permisos }`.
- Sesión persistida en IndexedDB (localforage) vía `IndexDbService`; estado en `AuthService` (signals).
- Header `Authorization: Bearer <accessToken>` lo añade `authInterceptor`. 401 → logout + /login.

## Criterios de aceptación (Gherkin)
```gherkin
Escenario: Login exitoso
  Dado credenciales válidas (admin / admin123 en demo)
  Cuando envío el formulario
  Entonces se guarda la sesión y navego a /dashboard

Escenario: Credenciales inválidas
  Cuando envío credenciales incorrectas
  Entonces veo un toast de error con el mensaje del backend y permanezco en /login

Escenario: Acceso sin sesión
  Cuando intento abrir /dashboard sin sesión
  Entonces el authGuard me redirige a /login

Escenario: Validación de formulario
  Cuando envío con campos vacíos
  Entonces se marcan los campos y no se llama al backend
```

## Reglas de negocio (UI)
- Botón deshabilitado mientras `loading`; validar `markAllAsTouched` antes de enviar.
- No exponer detalles técnicos del error; mostrar `message` del backend o genérico.
- `empresaId`/`usuarioId`/`permisos` salen del token; no se piden al usuario.

## Preguntas abiertas
- ¿Recordar usuario / "mantener sesión"? (v1: la sesión persiste en IndexedDB hasta logout o 401).
- ¿Refresh automático de token antes de expirar? (v1: no; 401 fuerza re-login).
