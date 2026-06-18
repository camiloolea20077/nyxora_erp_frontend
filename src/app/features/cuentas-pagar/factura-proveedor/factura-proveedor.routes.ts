import { Routes } from '@angular/router';

export const FACTURA_PROVEEDOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./index/index-factura-proveedor.component').then((m) => m.IndexFacturaProveedorComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./form/form-factura-proveedor.component').then((m) => m.FormFacturaProveedorComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detalle/detalle-factura-proveedor.component').then((m) => m.DetalleFacturaProveedorComponent),
  },
];
