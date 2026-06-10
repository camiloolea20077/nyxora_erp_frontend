import { Routes } from '@angular/router';

export const LOTE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index-lote.component').then((m) => m.IndexLoteComponent),
  },
];
