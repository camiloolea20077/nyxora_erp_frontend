import { Routes } from '@angular/router';

export const ACUERDO_PAGO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-acuerdo-pago.component').then((m) => m.IndexAcuerdoPagoComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./form/form-acuerdo-pago.component').then((m) => m.FormAcuerdoPagoComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detalle/detalle-acuerdo-pago.component').then((m) => m.DetalleAcuerdoPagoComponent),
  },
];
