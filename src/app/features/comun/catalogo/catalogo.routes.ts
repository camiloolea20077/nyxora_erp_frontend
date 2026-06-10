import { Routes } from '@angular/router';

export const CATALOGO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-catalogo.component').then((m) => m.IndexCatalogoComponent),
  },
];
