---
description: Andamia un módulo (feature) de frontend completo: tipos, servicio y pantallas (index/form/detalle)
---

Andamia el módulo de frontend para: **$ARGUMENTS**

Sigue el estándar del proyecto (reglas `.claude/rules/00..03`) y este orden:

1. **Contrato (agente contrato-api):** genera `features/<modulo>/models/<modulo>.model.ts` y
   `features/<modulo>/services/<modulo>.service.ts` tipados contra `ApiResponse`/`PageResponse`
   del backend (`../nyxora_erp/docs/api`, HUs, Swagger). Cero `any`.
2. **Diseño (skill interface-design):** define layout/estados de las pantallas; guarda notas en `docs/ui/`.
3. **Componentes (agente desarrollo-frontend), standalone + signals + OnPush:**
   - `form/form-<entidad>.component.{ts,html,css}` — dialog Reactive Forms (`model(false)` para `[(visible)]`, `output() saved`).
   - `detalle/detalle-<entidad>.component.{ts,html,css}` — dialog de solo lectura (si aplica).
   - `index/index-<entidad>.component.{ts,html,css}` — tabla `p-table` lazy server-side; estado en signals;
     `providers: [MessageService, ConfirmationService]`.
4. `features/<modulo>/<modulo>.routes.ts` (lazy, sin ruta `/nueva`) y regístralo en `app.routes.ts`.
5. Agrega el ítem en el **sidebar**.
6. Verifica: `npx tsc -p tsconfig.app.json --noEmit` y `npm run build` sin errores ni `any`.

Reglas de oro: `@if/@for` (track), `inject()`, formularios DTO con Reactive Forms, `ngModel` solo en
filtros/líneas dinámicas, un `.css` por componente, textos en español y código en inglés.
