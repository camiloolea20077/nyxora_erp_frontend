import { Routes } from '@angular/router';

export const ASIGNATURA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index-asignatura.component').then((m) => m.IndexAsignaturaComponent),
  },
];
