import { Routes } from '@angular/router';

export const OBLIGACION_PAGO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-obligacion-pago.component').then((m) => m.IndexObligacionPagoComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./form/form-obligacion-pago.component').then((m) => m.FormObligacionPagoComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detalle/detalle-obligacion-pago.component').then((m) => m.DetalleObligacionPagoComponent),
  },
];
