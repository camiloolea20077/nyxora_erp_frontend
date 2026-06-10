import { Routes } from '@angular/router';

export const SEDE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index-sede.component').then((m) => m.IndexSedeComponent),
  },
];
