import { Routes } from '@angular/router';

export const PROCESO_DISCIPLINARIO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-proceso-disciplinario.component').then((m) => m.IndexProcesoDisciplinarioComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detalle/detalle-proceso-disciplinario.component').then((m) => m.DetalleProcesoDisciplinarioComponent),
  },
];
