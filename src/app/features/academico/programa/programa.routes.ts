import { Routes } from '@angular/router';

export const PROGRAMA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index-programa.component').then((m) => m.IndexProgramaComponent),
  },
];
