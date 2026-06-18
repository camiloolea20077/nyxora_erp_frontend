import { Routes } from '@angular/router';

export const RUBRO_PRESUPUESTAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index-rubro.component').then((m) => m.IndexRubroComponent),
  },
];
