import { Routes } from '@angular/router';

export const DEPENDENCIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-dependencia.component').then((m) => m.IndexDependenciaComponent),
  },
];
