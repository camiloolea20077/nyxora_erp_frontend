import { Routes } from '@angular/router';

export const ORDEN_COMPRA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-orden-compra.component').then((m) => m.IndexOrdenCompraComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./form/form-orden-compra.component').then((m) => m.FormOrdenCompraComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./form/form-orden-compra.component').then((m) => m.FormOrdenCompraComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detalle/detalle-orden-compra.component').then((m) => m.DetalleOrdenCompraComponent),
  },
];
