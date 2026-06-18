import { Routes } from '@angular/router';

export const VINCULACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-vinculacion.component').then((m) => m.IndexVinculacionComponent),
  },
];
