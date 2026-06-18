import { Routes } from '@angular/router';

export const NOVEDAD_NOMINA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-novedad-nomina.component').then((m) => m.IndexNovedadNominaComponent),
  },
];
