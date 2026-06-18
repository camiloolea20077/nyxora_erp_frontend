import { Routes } from '@angular/router';

export const LIQUIDACION_NOMINA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-liquidacion-nomina.component').then((m) => m.IndexLiquidacionNominaComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detalle/detalle-liquidacion-nomina.component').then((m) => m.DetalleLiquidacionNominaComponent),
  },
];
