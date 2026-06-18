import { Routes } from '@angular/router';

export const REPORTES_ROUTES: Routes = [
  {
    path: 'balance-general',
    loadComponent: () => import('./balance/balance-general.component').then((m) => m.BalanceGeneralComponent),
  },
  {
    path: 'estado-resultados',
    loadComponent: () => import('./resultados/estado-resultados.component').then((m) => m.EstadoResultadosComponent),
  },
  {
    path: 'cartera',
    loadComponent: () => import('./cartera/cartera.component').then((m) => m.CarteraComponent),
  },
  {
    path: 'ejecucion-presupuestal',
    loadComponent: () =>
      import('./ejecucion/ejecucion-presupuestal.component').then((m) => m.EjecucionPresupuestalComponent),
  },
  {
    path: 'cierre-periodo',
    loadComponent: () => import('./cierre/cierre-periodo.component').then((m) => m.CierrePeriodoComponent),
  },
  { path: '', pathMatch: 'full', redirectTo: 'balance-general' },
];
