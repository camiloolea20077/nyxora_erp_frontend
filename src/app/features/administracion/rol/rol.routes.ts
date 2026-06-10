import { Routes } from '@angular/router';

export const ROL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index-rol.component').then((m) => m.IndexRolComponent),
  },
];
