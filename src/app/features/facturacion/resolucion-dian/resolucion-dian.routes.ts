import { Routes } from '@angular/router';

export const RESOLUCION_DIAN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-resolucion-dian.component').then((m) => m.IndexResolucionDianComponent),
  },
];
