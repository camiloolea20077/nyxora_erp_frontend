import { Routes } from '@angular/router';

export const EVALUACION_PROGRAMA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-evaluacion-programa.component').then((m) => m.IndexEvaluacionProgramaComponent),
  },
];
