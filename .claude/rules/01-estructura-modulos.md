# Regla 01 — Estructura de proyecto y módulos

## Árbol
```
src/app/
├── core/
│   ├── guards/            auth.guard.ts (functional CanActivateFn)
│   ├── interceptors/      auth.interceptor.ts (functional HttpInterceptorFn)
│   ├── models/            auth.model.ts
│   └── services/          auth.service.ts · index-db.service.ts
├── shared/
│   ├── models/            cols.model.ts · response.model.ts · pageable.model.ts (← utils del equipo)
│   ├── services/          alert.service.ts · helper.service.ts (← utils del equipo)
│   └── components/        componentes reutilizables (toolbar tabla, page-header, etc.)
├── layout/                main-layout · sidebar · topbar
└── features/
    └── <modulo>/
        ├── index/         index-<entidad>.component.{ts,html,css}     ← tabla
        ├── form/          form-<entidad>.component.{ts,html,css}      ← dialog crear/editar
        ├── detalle/       detalle-<entidad>.component.{ts,html,css}   ← dialog ver
        ├── models/        <modulo>.model.ts                 ← TODOS los tipos del módulo
        ├── services/      <modulo>.service.ts
        └── <modulo>.routes.ts
```
> Los **utils compartidos** (`response.model.ts`, `pageable.model.ts`, `cols.model.ts`, `alert.service.ts`,
> `helper.service.ts`, interceptor, index-db) los aporta el equipo — respétalos, no los reinventes.

## Reglas de estructura
- **Todos los tipos de un módulo en un único `<modulo>.model.ts`** (Model, TableModel, CreateDto, UpdateDto, LineaUI).
- **Un archivo de estilos por componente** (`.css`); nunca estilos compartidos entre componentes.
- **Standalone** components; rutas **lazy** (`loadComponent` / `loadChildren`).
- Los formularios de crear/editar son **dialogs (`p-dialog`)**, NUNCA páginas con navegación propia.
  ⇒ no existe ruta `/nueva` ni `/editar/:id`.

## Naming
- **Archivos de componente con sufijo `.component`:** `index-<entidad>.component.ts/html/css`,
  `form-<entidad>.component.ts/html/css`, `detalle-<entidad>.component.ts/html/css`.
  **Clase con sufijo `Component`** (`IndexMarcaComponent`, `FormMarcaComponent`, `DetalleMarcaComponent`);
  selector `app-index-marca`, etc.
- `index-<entidad>` (tabla) · `form-<entidad>` (dialog) · `detalle-<entidad>` (dialog).
- FormGroup: `frm<Entidad>` (`frmProducto`). Flags de dialog: `showForm`, `showDetalle` (signals).
- `isEdit` derivado de si hay registro de edición. `loading`, `loadingDetalle` separados.
- `onSaved()` lo emite el form; el index recarga la tabla.

## Modelos por módulo (patrón)
```ts
export interface ProductoModel { id: number; codigo: string; nombre: string; /* … */ }
export interface ProductoTableModel { id: number; codigo: string; nombre: string; active: boolean; }
export interface CreateProductoDto { codigo: string; nombre: string; /* … */ }
export interface UpdateProductoDto extends CreateProductoDto { id: number; active?: boolean; }
// Líneas dinámicas (carrito/compras): SIEMPRE con _id UUID para el track
export interface ProductoLineaUI { _id: string; productoId: number | null; cantidad: number; /* … */ }
```

## Rutas (lazy)
```ts
export const routes: Routes = [
  { path: '', canActivate: [authGuard], component: MainLayout, children: [
    { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
    { path: 'productos', loadChildren: () => import('./features/productos/producto.routes').then(m => m.PRODUCTO_ROUTES) },
  ]},
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: '**', redirectTo: 'dashboard' },
];
```

## Orden de desarrollo de un módulo
1. `models/<modulo>.model.ts` (tipos) — apóyate en el agente **contrato-api**.
2. `services/<modulo>.service.ts` (tipado contra `ApiResponse`/`PageResponseDto`).
3. Diseño de pantalla con la skill **interface-design**.
4. `form/` (dialog, Reactive Forms) → `detalle/` (si aplica) → `index/` (tabla lazy).
5. `<modulo>.routes.ts` → registrar en `app.routes.ts` → ítem en el sidebar.
