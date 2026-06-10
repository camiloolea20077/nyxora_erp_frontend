import { Routes } from '@angular/router';

export const CATEGORIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-categoria.component').then((m) => m.IndexCategoriaComponent),
  },
];
