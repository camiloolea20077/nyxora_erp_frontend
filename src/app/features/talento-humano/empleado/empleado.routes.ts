import { Routes } from '@angular/router';

export const EMPLEADO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index-empleado.component').then((m) => m.IndexEmpleadoComponent),
  },
  {
    path: ':id/hoja-vida',
    loadComponent: () =>
      import('./hoja-vida/hoja-vida-empleado.component').then((m) => m.HojaVidaEmpleadoComponent),
  },
];
