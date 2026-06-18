import { Routes } from '@angular/router';

export const CARGO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index-cargo.component').then((m) => m.IndexCargoComponent),
  },
];
