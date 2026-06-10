import { Routes } from '@angular/router';

export const IMPUESTO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-impuesto.component').then((m) => m.IndexImpuestoComponent),
  },
];
