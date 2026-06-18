import { Routes } from '@angular/router';

export const GRUPO_ACADEMICO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-grupo-academico.component').then((m) => m.IndexGrupoAcademicoComponent),
  },
];
