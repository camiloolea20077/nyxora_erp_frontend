# Nyxora ERP — Frontend (CLAUDE.md)

Frontend del ERP **Nyxora**. SPA profesional, modular y **fuertemente tipada**.
Stack: **Angular 20 (standalone + signals) · PrimeNG 20 (+ @primeng/themes Aura) · Tailwind CSS 4 ·
TypeScript 5.9 strict · RxJS 7 · localforage (sesión en IndexedDB) · uuid (líneas dinámicas)**.

> El **backend** vive en el proyecto hermano `../nyxora_erp` (Spring WebFlux). Su API y sus HUs son
> la fuente de verdad de los contratos: `../nyxora_erp/docs/api/*.http`, `../nyxora_erp/docs/hu/*.md`
> y Swagger en `http://localhost:8081/swagger-ui.html` (`/v3/api-docs`).

## Reglas obligatorias (leer antes de codificar)
- [.claude/rules/00-convenciones-frontend.md](.claude/rules/00-convenciones-frontend.md) — Angular 20, signals, control flow, `inject()`, **cero `any`**.
- [.claude/rules/01-estructura-modulos.md](.claude/rules/01-estructura-modulos.md) — estructura de features, index/form/detalle (dialogs), naming, modelos por módulo.
- [.claude/rules/02-ui-primeng-tailwind.md](.claude/rules/02-ui-primeng-tailwind.md) — PrimeNG 20 + Aura, Tailwind 4, design system, skill `interface-design`.
- [.claude/rules/03-servicios-http-tipado.md](.claude/rules/03-servicios-http-tipado.md) — contrato real del backend (`ApiResponse`/`PageResponseDto`), servicios, interceptor, sesión.

## Agentes (`.claude/agents/`)
- **contrato-api** — lee la API del backend (`../nyxora_erp/docs/api`, HUs, Swagger) y genera **modelos + servicios tipados** que calzan exactamente con el contrato. Úsalo SIEMPRE antes de construir un módulo.
- **desarrollo-frontend** — Desarrollador Angular 20 senior. Construye el vertical slice de UI (models · service · index · form · detalle · routes) siguiendo las reglas y la skill `interface-design`.

## Comandos (`.claude/commands/`)
- `/nueva-hu-front <descripción>` — documenta una HU de frontend en `docs/hu`.
- `/nueva-feature <feature>` — andamia un módulo completo (estructura + tipos + servicio + pantallas).

## Skill de diseño
- **interface-design** — úsala SIEMPRE para diseñar las pantallas (layout, jerarquía visual, estados)
  antes de escribir el HTML/estilos. El ERP debe verse **profesional y consistente**.

## Documentación (`docs/`)
- `docs/hu/` — Historias de Usuario de frontend (plantilla + proyectadas).
- `docs/ui/` — guías/decisiones de diseño producidas con `interface-design`.

## Verificación
- Servir: `npm start` (http://localhost:4200). Build: `npm run build`. Lint de tipos: `npx tsc -p tsconfig.app.json --noEmit`.
- El backend debe estar arriba en `:8081` para datos reales (`environment.apiUrl = 'http://localhost:8081/api/'`).

## No negociable
- **Sin `any`.** Todo modelo, parámetro y retorno tipado. Si falta un tipo, créalo (ver contrato-api).
- **Standalone + signals + OnPush.** Nada de NgModules de feature, nada de `*ngIf/*ngFor` (usar `@if/@for`).
- Formularios DTO con **Reactive Forms**; `ngModel` solo en filtros y líneas dinámicas.
- Cada componente con su propio archivo de estilos; el diseño base, con Tailwind + tokens Aura.
