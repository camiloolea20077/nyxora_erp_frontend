import { Routes } from '@angular/router';

export const UBICACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-ubicacion.component').then((m) => m.IndexUbicacionComponent),
  },
];
