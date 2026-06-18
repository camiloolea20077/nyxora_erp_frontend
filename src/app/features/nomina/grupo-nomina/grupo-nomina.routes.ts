import { Routes } from '@angular/router';

export const GRUPO_NOMINA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-grupo-nomina.component').then((m) => m.IndexGrupoNominaComponent),
  },
];
