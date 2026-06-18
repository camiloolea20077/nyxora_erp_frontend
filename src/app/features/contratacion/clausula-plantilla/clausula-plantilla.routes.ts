import { Routes } from '@angular/router';

export const CLAUSULA_PLANTILLA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-clausula-plantilla.component').then((m) => m.IndexClausulaPlantillaComponent),
  },
];
