import { Routes } from '@angular/router';

export const CONTRATO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-contrato.component').then((m) => m.IndexContratoComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./form/form-contrato.component').then((m) => m.FormContratoComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./form/form-contrato.component').then((m) => m.FormContratoComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detalle/detalle-contrato.component').then((m) => m.DetalleContratoComponent),
  },
];
