import { Routes } from '@angular/router';

export const EMPRESA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./empresa.component').then((m) => m.EmpresaComponent),
  },
];
