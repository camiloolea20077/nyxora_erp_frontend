import { Routes } from '@angular/router';

export const VIGENCIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-vigencia.component').then((m) => m.IndexVigenciaComponent),
  },
];
