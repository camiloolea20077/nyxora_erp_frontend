import { Routes } from '@angular/router';

export const ARQUEO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index-arqueo.component').then((m) => m.IndexArqueoComponent),
  },
];
