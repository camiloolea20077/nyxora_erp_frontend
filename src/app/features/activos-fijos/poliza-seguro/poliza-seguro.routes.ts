import { Routes } from '@angular/router';

export const POLIZA_SEGURO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-poliza-seguro.component').then((m) => m.IndexPolizaSeguroComponent),
  },
];
