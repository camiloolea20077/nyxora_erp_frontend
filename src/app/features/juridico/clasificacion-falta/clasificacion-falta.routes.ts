import { Routes } from '@angular/router';

export const CLASIFICACION_FALTA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-clasificacion-falta.component').then((m) => m.IndexClasificacionFaltaComponent),
  },
];
