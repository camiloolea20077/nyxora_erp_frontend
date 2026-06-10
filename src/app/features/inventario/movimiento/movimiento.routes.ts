import { Routes } from '@angular/router';

export const MOVIMIENTO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-movimiento.component').then((m) => m.IndexMovimientoComponent),
  },
];
