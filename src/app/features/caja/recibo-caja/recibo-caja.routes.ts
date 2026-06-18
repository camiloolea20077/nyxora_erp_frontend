import { Routes } from '@angular/router';

export const RECIBO_CAJA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-recibo-caja.component').then((m) => m.IndexReciboCajaComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./form/form-recibo-caja.component').then((m) => m.FormReciboCajaComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detalle/detalle-recibo-caja.component').then((m) => m.DetalleReciboCajaComponent),
  },
];
