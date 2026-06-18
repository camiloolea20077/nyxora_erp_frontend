import { Routes } from '@angular/router';

export const MODALIDAD_CONTRATO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-modalidad-contrato.component').then((m) => m.IndexModalidadContratoComponent),
  },
];
