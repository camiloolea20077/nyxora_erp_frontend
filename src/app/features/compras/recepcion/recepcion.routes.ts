import { Routes } from '@angular/router';

export const RECEPCION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-recepcion.component').then((m) => m.IndexRecepcionComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./form/form-recepcion.component').then((m) => m.FormRecepcionComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detalle/detalle-recepcion.component').then((m) => m.DetalleRecepcionComponent),
  },
];
