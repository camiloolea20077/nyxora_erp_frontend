import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

/** Placeholder reutilizable para módulos aún sin pantalla. */
const placeholder = () =>
  import('./shared/components/placeholder/placeholder.component').then((m) => m.PlaceholderComponent);

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      // ── Administración (Sprint 1) ──
      {
        path: 'sedes',
        loadChildren: () =>
          import('./features/administracion/sede/sede.routes').then((m) => m.SEDE_ROUTES),
      },
      {
        path: 'vigencias',
        loadChildren: () =>
          import('./features/administracion/vigencia/vigencia.routes').then((m) => m.VIGENCIA_ROUTES),
      },
      {
        path: 'parametros',
        loadChildren: () =>
          import('./features/administracion/parametro/parametro.routes').then(
            (m) => m.PARAMETRO_ROUTES,
          ),
      },
      {
        path: 'permisos',
        loadChildren: () =>
          import('./features/administracion/permiso/permiso.routes').then((m) => m.PERMISO_ROUTES),
      },
      {
        path: 'roles',
        loadChildren: () =>
          import('./features/administracion/rol/rol.routes').then((m) => m.ROL_ROUTES),
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./features/administracion/usuario/usuario.routes').then((m) => m.USUARIO_ROUTES),
      },
      {
        path: 'empresas',
        loadChildren: () =>
          import('./features/administracion/empresa/empresa.routes').then((m) => m.EMPRESA_ROUTES),
      },
      {
        path: 'tipos-documento',
        loadChildren: () =>
          import('./features/administracion/tipo-documento/tipo-documento.routes').then(
            (m) => m.TIPO_DOCUMENTO_ROUTES,
          ),
      },

      // ── Común (Sprint 2) ──
      {
        path: 'terceros',
        loadChildren: () =>
          import('./features/comun/tercero/tercero.routes').then((m) => m.TERCERO_ROUTES),
      },
      {
        path: 'productos',
        loadChildren: () =>
          import('./features/comun/producto/producto.routes').then((m) => m.PRODUCTO_ROUTES),
      },
      {
        path: 'catalogos',
        loadChildren: () =>
          import('./features/comun/catalogo/catalogo.routes').then((m) => m.CATALOGO_ROUTES),
      },
      {
        path: 'categorias',
        loadChildren: () =>
          import('./features/comun/categoria/categoria.routes').then((m) => m.CATEGORIA_ROUTES),
      },
      {
        path: 'impuestos',
        loadChildren: () =>
          import('./features/comun/impuesto/impuesto.routes').then((m) => m.IMPUESTO_ROUTES),
      },
      {
        path: 'recursos',
        loadChildren: () =>
          import('./features/comun/recurso/recurso.routes').then((m) => m.RECURSO_ROUTES),
      },

      // ── Organización (Sprint 3) ──
      {
        path: 'centros-costo',
        loadChildren: () =>
          import('./features/organizacion/centro-costo/centro-costo.routes').then(
            (m) => m.CENTRO_COSTO_ROUTES,
          ),
      },
      {
        path: 'dependencias',
        loadChildren: () =>
          import('./features/organizacion/dependencia/dependencia.routes').then(
            (m) => m.DEPENDENCIA_ROUTES,
          ),
      },
      {
        path: 'proyectos',
        loadChildren: () =>
          import('./features/organizacion/proyecto/proyecto.routes').then((m) => m.PROYECTO_ROUTES),
      },

      // ── Contabilidad (Sprint 4) ──
      {
        path: 'cuentas',
        loadChildren: () =>
          import('./features/contabilidad/cuenta/cuenta.routes').then((m) => m.CUENTA_ROUTES),
      },
      {
        path: 'periodos-contables',
        loadChildren: () =>
          import('./features/contabilidad/periodo/periodo.routes').then((m) => m.PERIODO_ROUTES),
      },
      {
        path: 'comprobantes',
        loadChildren: () =>
          import('./features/contabilidad/comprobante/comprobante.routes').then(
            (m) => m.COMPROBANTE_ROUTES,
          ),
      },
      {
        path: 'saldos',
        loadChildren: () =>
          import('./features/contabilidad/saldo/saldo.routes').then((m) => m.SALDO_ROUTES),
      },

      // ── Inventario (Sprint 5) ──
      {
        path: 'bodegas',
        loadChildren: () =>
          import('./features/inventario/bodega/bodega.routes').then((m) => m.BODEGA_ROUTES),
      },
      {
        path: 'ubicaciones',
        loadChildren: () =>
          import('./features/inventario/ubicacion/ubicacion.routes').then((m) => m.UBICACION_ROUTES),
      },
      {
        path: 'lotes',
        loadChildren: () =>
          import('./features/inventario/lote/lote.routes').then((m) => m.LOTE_ROUTES),
      },
      {
        path: 'marcas',
        loadChildren: () =>
          import('./features/inventario/marca/marca.routes').then((m) => m.MARCA_ROUTES),
      },
      {
        path: 'movimientos-inventario',
        loadChildren: () =>
          import('./features/inventario/movimiento/movimiento.routes').then(
            (m) => m.MOVIMIENTO_ROUTES,
          ),
      },
      {
        path: 'saldos-inventario',
        loadChildren: () =>
          import('./features/inventario/existencia/existencia.routes').then(
            (m) => m.EXISTENCIA_ROUTES,
          ),
      },

      // ── Compras (Sprint 6) ──
      {
        path: 'ordenes-compra',
        loadChildren: () =>
          import('./features/compras/orden-compra/orden-compra.routes').then(
            (m) => m.ORDEN_COMPRA_ROUTES,
          ),
      },
      {
        path: 'recepciones',
        loadChildren: () =>
          import('./features/compras/recepcion/recepcion.routes').then((m) => m.RECEPCION_ROUTES),
      },

      // Módulos del menú aún sin pantalla → placeholder (se irán reemplazando por su CRUD real).
      // Los módulos ya construidos se registran ARRIBA, ANTES del comodín.
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: '**', loadComponent: placeholder },
    ],
  },
];
