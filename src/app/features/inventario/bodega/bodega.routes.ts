import { Routes } from '@angular/router';

export const BODEGA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index-bodega.component').then((m) => m.IndexBodegaComponent),
  },
];
