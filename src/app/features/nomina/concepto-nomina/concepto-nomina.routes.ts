import { Routes } from '@angular/router';

export const CONCEPTO_NOMINA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-concepto-nomina.component').then((m) => m.IndexConceptoNominaComponent),
  },
];
