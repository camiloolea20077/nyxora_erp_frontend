import { Routes } from '@angular/router';

export const PARAMETRO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-parametro.component').then((m) => m.IndexParametroComponent),
  },
];
