import { Routes } from '@angular/router';

export const FALTA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index-falta.component').then((m) => m.IndexFaltaComponent),
  },
];
