import { Routes } from '@angular/router';

export const PAC_PRESUPUESTAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pac-presupuestal.component').then((m) => m.PacPresupuestalComponent),
  },
];
