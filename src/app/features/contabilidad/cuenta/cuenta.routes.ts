import { Routes } from '@angular/router';

export const CUENTA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index-cuenta.component').then((m) => m.IndexCuentaComponent),
  },
];
