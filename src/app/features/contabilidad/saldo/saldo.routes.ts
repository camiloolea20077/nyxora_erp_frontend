import { Routes } from '@angular/router';

export const SALDO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index-saldo.component').then((m) => m.IndexSaldoComponent),
  },
];
