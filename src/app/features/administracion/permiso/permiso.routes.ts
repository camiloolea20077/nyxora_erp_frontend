import { Routes } from '@angular/router';

export const PERMISO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-permiso.component').then((m) => m.IndexPermisoComponent),
  },
];
