---
name: interface-design
description: Diseña la interfaz de una pantalla o módulo del ERP Nyxora ANTES de codificar — produce una especificación de diseño profesional y consistente (layout, jerarquía visual, estados, responsive, mapeo a PrimeNG 20 + Aura + Tailwind 4) en docs/ui/. Úsala al iniciar cualquier feature/HU de frontend, o cuando una pantalla necesite repensarse.
---

# Skill: interface-design — Nyxora ERP (Angular 20 · PrimeNG 20 · Aura · Tailwind 4)

Tu rol al ejecutar esta skill es el de **Diseñador de Producto / UI senior** para un ERP profesional.
Produces una **especificación de diseño** (no código de componente) que el agente `desarrollo-frontend`
implementará. El objetivo es un ERP **claro, denso lo justo, consistente y profesional**.

## Cuándo se usa
- Al arrancar una HU/feature de frontend, **antes** de escribir HTML/estilos.
- Cuando una pantalla existente se siente inconsistente o confusa y hay que repensarla.

## Entradas que debes reunir primero
1. La **HU** (`docs/hu/HU-FE-*.md`) y la HU de backend relacionada (`../nyxora_erp/docs/hu/`).
2. El **contrato de datos** (agente `contrato-api`): qué campos hay (`XxxModel`, `XxxTableModel`) y qué
   acciones (crear/editar/eliminar/aprobar/anular/confirmar…). El diseño se deriva de datos + acciones reales.
3. Las **reglas de UI** del proyecto: `.claude/rules/02-ui-primeng-tailwind.md` (tokens, patrones, anchos de dialog).

## Proceso (sigue este orden)
1. **Propósito y usuario:** ¿qué tarea resuelve la pantalla y con qué frecuencia? (define densidad y atajos).
2. **Arquetipo de layout** — elige uno y justifícalo:
   - **Lista + dialogs** (CRUD estándar): tabla `p-table` lazy + dialog crear/editar + dialog detalle. *(Por defecto en el ERP.)*
   - **Maestro–detalle** (documentos con líneas: compras, comprobantes): encabezado + grid de líneas dinámicas.
   - **Dashboard** (KPIs + gráficos): grid de cards con métricas y `chart`.
   - **POS / pantalla táctil**: 2 paneles a pantalla completa, objetivos grandes, sin navegación.
3. **Jerarquía visual:** header de módulo (icono en chip + título + subtítulo + acción primaria a la derecha),
   zona de filtros, contenido (tabla/cards), acciones por fila. Define qué es primario/secundario/terciario.
4. **Estados (obligatorio diseñarlos todos):** cargando (skeleton/spinner), vacío (ilustración/mensaje + CTA),
   error (alerta + reintento), sin permisos (acción deshabilitada con tooltip), guardando (botón `loading`).
5. **Formulario (si aplica):** agrupación de campos, orden lógico, obligatorios, validaciones y mensajes (español),
   ancho de dialog según `02-ui` (simple 420 / estándar 560 / líneas 860 / detalle 780).
6. **Responsive:** comportamiento en ≥1280 (escritorio, foco del ERP), 768–1279 (tablet: colapsar columnas
   secundarias / sidebar a íconos) y <768 (apilar; tabla → cards si aplica).
7. **Mapeo a componentes PrimeNG 20** (no inventes): tabla→`p-table`, formularios→`p-dialog`+inputs,
   selección→`p-select`/`p-multiSelect`, fechas→`p-datepicker`, números/moneda→`p-inputNumber`,
   confirmaciones→`ConfirmationService`, feedback→`p-toast`. Usa el preset **Aura** (no hardcodear color del tema).

## Sistema de diseño (usa estos tokens/patrones, no inventes otros)
- **Color (azul/navy profesional, SIN morados):** `--nx-primary #2563eb` (hover `#1d4ed8`) para CTA/acciones;
  paneles oscuros navy `#1e293b`→`#0f172a` (`--nx-brand-panel`); superficie `#ffffff`, fondo `#f1f5f9`,
  borde `#e2e8f0`, texto `#0f172a`, muted `#64748b`; success `#10b981` / warning `#f59e0b` / danger `#ef4444`.
  **Prohibido violeta/morado.**
- **Tipografía:** `Outfit` para UI; `JetBrains Mono` para números (precios, cantidades, códigos, IDs).
- **Forma/espacio:** cards `rounded-2xl border` (~16px); espaciado con Tailwind (`gap-3/4`, `p-4/6`); densidad media.
- **Patrones reutilizables (consistencia > creatividad):** header de módulo, table-card, fila clickeable
  (`clickable-row` abre detalle; celda de acciones con `stopPropagation`), badges de estado por color,
  pill de stock en rojo si supera el disponible.

## Salida (entregable)
Crea/actualiza `docs/ui/<modulo>.md` con estas secciones:
1. **Propósito y usuario** · 2. **Arquetipo de layout** (elegido + por qué) ·
3. **Wireframe ASCII** de la pantalla (y de cada dialog) · 4. **Jerarquía y acciones** (primaria/secundarias) ·
5. **Campos del formulario** (label, tipo, validación, obligatorio) · 6. **Estados** (cargando/vacío/error/permiso) ·
7. **Responsive** (qué cambia por breakpoint) · 8. **Mapeo a componentes PrimeNG** · 9. **Notas de consistencia**
(qué patrón existente reutiliza). Mantén el ASCII simple y claro.

## Principios
- **Consistencia primero:** reutiliza patrones ya definidos antes de crear nuevos.
- **Claridad sobre decoración:** el ERP es herramienta de trabajo; menos ruido, jerarquía evidente, números legibles.
- **Diseña los estados, no solo el "happy path".** Una pantalla sin estado vacío/error no está diseñada.
- **No produces código de componente** aquí; produces la especificación que guía a `desarrollo-frontend`.
