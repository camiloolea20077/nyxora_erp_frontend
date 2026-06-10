import { Routes } from '@angular/router';

export const PRODUCTO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-producto.component').then((m) => m.IndexProductoComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./form/form-producto.component').then((m) => m.FormProductoComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./form/form-producto.component').then((m) => m.FormProductoComponent),
  },
];
