import { Routes } from '@angular/router';

export const FACTURA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-factura.component').then((m) => m.IndexFacturaComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./form/form-factura.component').then((m) => m.FormFacturaComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./form/form-factura.component').then((m) => m.FormFacturaComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detalle/detalle-factura.component').then((m) => m.DetalleFacturaComponent),
  },
];
