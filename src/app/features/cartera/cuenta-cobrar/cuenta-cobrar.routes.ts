import { Routes } from '@angular/router';

export const CUENTA_COBRAR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-cuenta-cobrar.component').then((m) => m.IndexCuentaCobrarComponent),
  },
];
