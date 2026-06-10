import { Routes } from '@angular/router';

export const EXISTENCIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-existencia.component').then((m) => m.IndexExistenciaComponent),
  },
];
