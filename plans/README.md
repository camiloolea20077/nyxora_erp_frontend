# Implementation Plans — Nyxora ERP Frontend

Generados por el skill `improve` el 2026-06-11, auditoría nivel `standard` sobre el commit `80416b7`
(branch `main`; había cambios sin commitear en orden-compra/tercero al auditar). Ejecutar en el
orden de la tabla salvo dependencias. Cada ejecutor: leer el plan completo, respetar sus STOP
conditions y actualizar su fila al terminar.

Los planes del BACKEND viven en `D:\Proyectos Camilo\erp_camilo\nyxora_erp\plans\` (001–009).
Numeración `F##` para distinguir.

## Execution order & status

| Plan | Title | Priority | Effort | Depends on | Status |
|------|-------|----------|--------|------------|--------|
| F03  | Baseline de tests + consolidar contrato API duplicado | P2* | M | — | TODO |
| F01  | Refresh silencioso + Authorization en requests FormData | P1 | M | — (coordinar backend 002) | TODO |
| F02  | RBAC en UI: menú, rutas y acciones por permiso | P2 | M | backend 006 (para efecto real) | TODO |

\* F03 va primero en orden de ejecución (los specs de F01/F02 se apoyan en su baseline), aunque F01
corrige los bugs de mayor impacto.

Status values: TODO | IN PROGRESS | DONE | BLOCKED (con motivo) | REJECTED (con justificación)

## Dependency notes

- **F03 antes que F01/F02 (recomendado)**: aporta la suite donde viven sus specs y unifica
  `ApiResponse` (F01 toca `auth.service.ts`, que hoy importa el contrato duplicado que F03 elimina —
  si F01 corre primero, que use `ApiResponse` de `shared/models/api.model.ts` directamente).
- **F01 ↔ backend plan 002**: cuando el backend rechace refresh-tokens-como-access, el refresh
  silencioso de F01 es lo que evita que los usuarios noten el cambio. Probar juntos.
- **F02 ← backend plan 006**: el RBAC de UI sin enforcement del backend es solo cosmético; aterrizar
  F02 antes no hace daño, pero el valor completo llega con 006.

## Estado general del frontend (recon 2026-06-11)

- **Stack**: Angular 20 (standalone, signals, zoneless) + PrimeNG 20/Aura + Tailwind 4 + localforage
  (IndexedDB). Typecheck limpio (`npx tsc --noEmit -p tsconfig.app.json` → exit 0). Sin ESLint, sin CI,
  1 solo spec.
- **Cobertura de pantallas vs backend**: TODOS los módulos con backend tienen CRUD funcional —
  Administración (8 features), Común (terceros+satélites, productos+satélites, categorías, impuestos,
  recursos, catálogos), Organización (3), Contabilidad (cuentas, periodos, comprobantes, saldos),
  Inventario (6), Compras (órdenes + recepciones). Login + layout + dashboard + guard + interceptor.
  Los módulos sin backend (facturación, cartera, caja, nómina…) están en el menú apuntando a un
  placeholder — listos para crecer con los planes 007/008 del backend.
- **Arquitectura consistente**: cada feature = `routes.ts` + `index/` + `form/` + `models/` +
  `services/`; services delgados tipados con `ApiResponse`/`PageResponse`; lazy loading por ruta.
  Buena base para escalar.

## Hallazgos sin plan (registrados para no re-auditar)

- **Guard sin validación de expiración** (`core/guards/auth.guard.ts`): solo comprueba que exista
  token; uno expirado pasa y revienta en el primer HTTP. Mitigado de facto por F01 (refresh ante
  401); validar `exp` del JWT en el guard queda como mejora S posterior.
- **JWT en IndexedDB**: accesible a cualquier script de la página (mismo riesgo que localStorage).
  Sin sinks XSS detectados (cero `innerHTML`/`bypassSecurity` en `src/`), Angular escapa por defecto
  → riesgo aceptado por ahora. La alternativa (refresh en cookie HttpOnly) requiere cambio de backend;
  decisión de producto.
- **`environment.production.ts` con `apiUrl: '/api/'`**: correcto solo detrás de un proxy en el
  mismo host; documentar la topología de despliegue cuando exista.
- **Typos en nombres de archivo**: `responde.models.ts` (F03 lo elimina), `heades-clients.ts`
  (renombrar al tocarlo).
- **Archivo extraviado**: `src/app/features/compras/.claude/settings.local.json` — eliminar.
- **Sin ESLint**: solo Prettier (config en `package.json`). Añadir angular-eslint es decisión de
  tooling pendiente.

## Findings considered and rejected

- **XSS por interpolación**: no hay `innerHTML` ni `DomSanitizer.bypass*` en `src/` — el binding de
  Angular escapa; nada que corregir hoy.
- **Menú muestra módulos sin pantalla**: by design (placeholder explícito en `app.routes.ts:199-202`);
  F02 además los dejará ocultables por permiso cuando existan.
- **`ng build` con presupuesto/dist**: build dev compila; no se auditó el bundle de producción
  (sin presupuestos definidos aún — pendiente cuando haya despliegue real).

## Qué NO se auditó

Calidad fina de cada uno de los ~30 componentes CRUD (se muestrearon orden-compra, tercero, rol,
permiso); accesibilidad; rendimiento de tablas con volúmenes reales; el bundle de producción;
compatibilidad de versiones PrimeNG 20 vs @primeng/themes 21.
