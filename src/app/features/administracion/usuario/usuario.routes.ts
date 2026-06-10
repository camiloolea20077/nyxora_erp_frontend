import { Routes } from '@angular/router';

export const USUARIO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-usuario.component').then((m) => m.IndexUsuarioComponent),
  },
];
