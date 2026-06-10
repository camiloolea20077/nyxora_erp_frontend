import { Routes } from '@angular/router';

export const RECURSO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-recurso.component').then((m) => m.IndexRecursoComponent),
  },
];
