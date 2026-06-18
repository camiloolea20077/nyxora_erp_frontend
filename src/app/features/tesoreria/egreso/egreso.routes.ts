import { Routes } from '@angular/router';

export const EGRESO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index-egreso.component').then((m) => m.IndexEgresoComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./form/form-egreso.component').then((m) => m.FormEgresoComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./detalle/detalle-egreso.component').then((m) => m.DetalleEgresoComponent),
  },
];
