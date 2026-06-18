import { Routes } from '@angular/router';

export const ACTIVO_FIJO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-activo-fijo.component').then((m) => m.IndexActivoFijoComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detalle/detalle-activo-fijo.component').then((m) => m.DetalleActivoFijoComponent),
  },
];
