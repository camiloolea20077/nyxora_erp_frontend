import { Routes } from '@angular/router';

export const CPC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index-cpc.component').then((m) => m.IndexCpcComponent),
  },
];
