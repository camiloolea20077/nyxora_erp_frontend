import { Routes } from '@angular/router';

export const CUENTA_BANCARIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-cuenta-bancaria.component').then((m) => m.IndexCuentaBancariaComponent),
  },
];
