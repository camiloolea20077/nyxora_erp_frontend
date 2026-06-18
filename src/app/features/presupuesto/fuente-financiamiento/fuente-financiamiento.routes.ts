import { Routes } from '@angular/router';

export const FUENTE_FINANCIAMIENTO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-fuente-financiamiento.component').then((m) => m.IndexFuenteFinanciamientoComponent),
  },
];
