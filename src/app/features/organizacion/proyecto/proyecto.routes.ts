import { Routes } from '@angular/router';

export const PROYECTO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-proyecto.component').then((m) => m.IndexProyectoComponent),
  },
];
