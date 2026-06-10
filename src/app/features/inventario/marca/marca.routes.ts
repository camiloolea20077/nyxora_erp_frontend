import { Routes } from '@angular/router';

export const MARCA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index-marca.component').then((m) => m.IndexMarcaComponent),
  },
];
