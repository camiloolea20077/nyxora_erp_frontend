import { Routes } from '@angular/router';

export const EJECUCION_PRESUPUESTAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ejecucion-presupuestal.component').then((m) => m.EjecucionPresupuestalComponent),
  },
];
