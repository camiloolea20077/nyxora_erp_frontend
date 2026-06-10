import { Routes } from '@angular/router';

export const COMPROBANTE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-comprobante.component').then((m) => m.IndexComprobanteComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./form/form-comprobante.component').then((m) => m.FormComprobanteComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detalle/detalle-comprobante.component').then((m) => m.DetalleComprobanteComponent),
  },
];
