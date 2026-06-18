import { Routes } from '@angular/router';

export const RETENCIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-retenciones.component').then((m) => m.IndexRetencionesComponent),
  },
];
