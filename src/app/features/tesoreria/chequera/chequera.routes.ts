import { Routes } from '@angular/router';

export const CHEQUERA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-chequera.component').then((m) => m.IndexChequeraComponent),
  },
];
