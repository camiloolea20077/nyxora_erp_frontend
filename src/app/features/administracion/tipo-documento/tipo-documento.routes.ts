import { Routes } from '@angular/router';

export const TIPO_DOCUMENTO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-tipo-documento.component').then((m) => m.IndexTipoDocumentoComponent),
  },
];
