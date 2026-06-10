import { Routes } from '@angular/router';

export const PERIODO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index-periodo.component').then((m) => m.IndexPeriodoComponent),
  },
];
