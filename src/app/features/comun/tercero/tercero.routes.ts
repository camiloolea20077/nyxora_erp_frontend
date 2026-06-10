import { Routes } from '@angular/router';

export const TERCERO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-tercero.component').then((m) => m.IndexTerceroComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./form/form-tercero.component').then((m) => m.FormTerceroComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./form/form-tercero.component').then((m) => m.FormTerceroComponent),
  },
];
