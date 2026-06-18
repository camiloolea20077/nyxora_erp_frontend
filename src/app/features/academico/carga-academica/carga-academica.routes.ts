import { Routes } from '@angular/router';

export const CARGA_ACADEMICA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-carga-academica.component').then((m) => m.IndexCargaAcademicaComponent),
  },
];
