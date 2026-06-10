import { Routes } from '@angular/router';

export const CENTRO_COSTO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-centro-costo.component').then((m) => m.IndexCentroCostoComponent),
  },
];
