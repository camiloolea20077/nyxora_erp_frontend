import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

/** Placeholder reutilizable para módulos aún sin pantalla. */
const placeholder = () =>
  import('./shared/components/placeholder/placeholder.component').then((m) => m.PlaceholderComponent);

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      // ── Administración (Sprint 1) ──
      {
        path: 'sedes',
        loadChildren: () =>
          import('./features/administracion/sede/sede.routes').then((m) => m.SEDE_ROUTES),
      },
      {
        path: 'vigencias',
        loadChildren: () =>
          import('./features/administracion/vigencia/vigencia.routes').then((m) => m.VIGENCIA_ROUTES),
      },
      {
        path: 'parametros',
        loadChildren: () =>
          import('./features/administracion/parametro/parametro.routes').then(
            (m) => m.PARAMETRO_ROUTES,
          ),
      },
      {
        path: 'permisos',
        loadChildren: () =>
          import('./features/administracion/permiso/permiso.routes').then((m) => m.PERMISO_ROUTES),
      },
      {
        path: 'roles',
        loadChildren: () =>
          import('./features/administracion/rol/rol.routes').then((m) => m.ROL_ROUTES),
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./features/administracion/usuario/usuario.routes').then((m) => m.USUARIO_ROUTES),
      },
      {
        path: 'empresas',
        loadChildren: () =>
          import('./features/administracion/empresa/empresa.routes').then((m) => m.EMPRESA_ROUTES),
      },
      {
        path: 'tipos-documento',
        loadChildren: () =>
          import('./features/administracion/tipo-documento/tipo-documento.routes').then(
            (m) => m.TIPO_DOCUMENTO_ROUTES,
          ),
      },

      // ── Común (Sprint 2) ──
      {
        path: 'terceros',
        loadChildren: () =>
          import('./features/comun/tercero/tercero.routes').then((m) => m.TERCERO_ROUTES),
      },
      {
        path: 'productos',
        loadChildren: () =>
          import('./features/comun/producto/producto.routes').then((m) => m.PRODUCTO_ROUTES),
      },
      {
        path: 'catalogos',
        loadChildren: () =>
          import('./features/comun/catalogo/catalogo.routes').then((m) => m.CATALOGO_ROUTES),
      },
      {
        path: 'categorias',
        loadChildren: () =>
          import('./features/comun/categoria/categoria.routes').then((m) => m.CATEGORIA_ROUTES),
      },
      {
        path: 'impuestos',
        loadChildren: () =>
          import('./features/comun/impuesto/impuesto.routes').then((m) => m.IMPUESTO_ROUTES),
      },
      {
        path: 'recursos',
        loadChildren: () =>
          import('./features/comun/recurso/recurso.routes').then((m) => m.RECURSO_ROUTES),
      },

      // ── Organización (Sprint 3) ──
      {
        path: 'centros-costo',
        loadChildren: () =>
          import('./features/organizacion/centro-costo/centro-costo.routes').then(
            (m) => m.CENTRO_COSTO_ROUTES,
          ),
      },
      {
        path: 'dependencias',
        loadChildren: () =>
          import('./features/organizacion/dependencia/dependencia.routes').then(
            (m) => m.DEPENDENCIA_ROUTES,
          ),
      },
      {
        path: 'proyectos',
        loadChildren: () =>
          import('./features/organizacion/proyecto/proyecto.routes').then((m) => m.PROYECTO_ROUTES),
      },

      // ── Contabilidad (Sprint 4) ──
      {
        path: 'cuentas',
        loadChildren: () =>
          import('./features/contabilidad/cuenta/cuenta.routes').then((m) => m.CUENTA_ROUTES),
      },
      {
        path: 'periodos-contables',
        loadChildren: () =>
          import('./features/contabilidad/periodo/periodo.routes').then((m) => m.PERIODO_ROUTES),
      },
      {
        path: 'comprobantes',
        loadChildren: () =>
          import('./features/contabilidad/comprobante/comprobante.routes').then(
            (m) => m.COMPROBANTE_ROUTES,
          ),
      },
      {
        path: 'saldos',
        loadChildren: () =>
          import('./features/contabilidad/saldo/saldo.routes').then((m) => m.SALDO_ROUTES),
      },

      // ── Inventario (Sprint 5) ──
      {
        path: 'bodegas',
        loadChildren: () =>
          import('./features/inventario/bodega/bodega.routes').then((m) => m.BODEGA_ROUTES),
      },
      {
        path: 'ubicaciones',
        loadChildren: () =>
          import('./features/inventario/ubicacion/ubicacion.routes').then((m) => m.UBICACION_ROUTES),
      },
      {
        path: 'lotes',
        loadChildren: () =>
          import('./features/inventario/lote/lote.routes').then((m) => m.LOTE_ROUTES),
      },
      {
        path: 'marcas',
        loadChildren: () =>
          import('./features/inventario/marca/marca.routes').then((m) => m.MARCA_ROUTES),
      },
      {
        path: 'movimientos-inventario',
        loadChildren: () =>
          import('./features/inventario/movimiento/movimiento.routes').then(
            (m) => m.MOVIMIENTO_ROUTES,
          ),
      },
      {
        path: 'saldos-inventario',
        loadChildren: () =>
          import('./features/inventario/existencia/existencia.routes').then(
            (m) => m.EXISTENCIA_ROUTES,
          ),
      },

      // ── Compras (Sprint 6) ──
      {
        path: 'ordenes-compra',
        loadChildren: () =>
          import('./features/compras/orden-compra/orden-compra.routes').then(
            (m) => m.ORDEN_COMPRA_ROUTES,
          ),
      },
      {
        path: 'recepciones',
        loadChildren: () =>
          import('./features/compras/recepcion/recepcion.routes').then((m) => m.RECEPCION_ROUTES),
      },

      // ── Facturación (Sprint 7) ──
      {
        path: 'facturas',
        loadChildren: () =>
          import('./features/facturacion/factura/factura.routes').then((m) => m.FACTURA_ROUTES),
      },
      {
        path: 'resoluciones-dian',
        loadChildren: () =>
          import('./features/facturacion/resolucion-dian/resolucion-dian.routes').then(
            (m) => m.RESOLUCION_DIAN_ROUTES,
          ),
      },

      // ── Cartera + Caja (Sprint 8) ──
      {
        path: 'cuentas-cobrar',
        loadChildren: () =>
          import('./features/cartera/cuenta-cobrar/cuenta-cobrar.routes').then(
            (m) => m.CUENTA_COBRAR_ROUTES,
          ),
      },
      {
        path: 'acuerdos-pago',
        loadChildren: () =>
          import('./features/cartera/acuerdo-pago/acuerdo-pago.routes').then(
            (m) => m.ACUERDO_PAGO_ROUTES,
          ),
      },
      {
        path: 'cajas',
        loadChildren: () =>
          import('./features/caja/caja/caja.routes').then((m) => m.CAJA_ROUTES),
      },
      {
        path: 'recibos',
        loadChildren: () =>
          import('./features/caja/recibo-caja/recibo-caja.routes').then((m) => m.RECIBO_CAJA_ROUTES),
      },
      {
        path: 'arqueos',
        loadChildren: () =>
          import('./features/caja/arqueo/arqueo.routes').then((m) => m.ARQUEO_ROUTES),
      },

      // ── Tesorería + Cuentas por pagar (Sprint 9) ──
      {
        path: 'cuentas-bancarias',
        loadChildren: () =>
          import('./features/tesoreria/cuenta-bancaria/cuenta-bancaria.routes').then(
            (m) => m.CUENTA_BANCARIA_ROUTES,
          ),
      },
      {
        path: 'chequeras',
        loadChildren: () =>
          import('./features/tesoreria/chequera/chequera.routes').then((m) => m.CHEQUERA_ROUTES),
      },
      {
        path: 'egresos',
        loadChildren: () =>
          import('./features/tesoreria/egreso/egreso.routes').then((m) => m.EGRESO_ROUTES),
      },
      {
        path: 'facturas-proveedor',
        loadChildren: () =>
          import('./features/cuentas-pagar/factura-proveedor/factura-proveedor.routes').then(
            (m) => m.FACTURA_PROVEEDOR_ROUTES,
          ),
      },
      {
        path: 'obligaciones',
        loadChildren: () =>
          import('./features/cuentas-pagar/obligacion-pago/obligacion-pago.routes').then(
            (m) => m.OBLIGACION_PAGO_ROUTES,
          ),
      },
      {
        path: 'retenciones',
        loadChildren: () =>
          import('./features/cuentas-pagar/retenciones/retenciones.routes').then(
            (m) => m.RETENCIONES_ROUTES,
          ),
      },

      // ── Presupuesto (Sprint 10) ──
      {
        path: 'rubros-presupuestales',
        loadChildren: () =>
          import('./features/presupuesto/rubro/rubro.routes').then((m) => m.RUBRO_PRESUPUESTAL_ROUTES),
      },
      {
        path: 'fuentes-financiamiento',
        loadChildren: () =>
          import('./features/presupuesto/fuente-financiamiento/fuente-financiamiento.routes').then(
            (m) => m.FUENTE_FINANCIAMIENTO_ROUTES,
          ),
      },
      {
        path: 'cpc',
        loadChildren: () => import('./features/presupuesto/cpc/cpc.routes').then((m) => m.CPC_ROUTES),
      },
      {
        path: 'ejecucion-presupuestal',
        loadChildren: () =>
          import('./features/presupuesto/ejecucion/ejecucion.routes').then(
            (m) => m.EJECUCION_PRESUPUESTAL_ROUTES,
          ),
      },
      {
        path: 'pac-presupuestal',
        loadChildren: () =>
          import('./features/presupuesto/pac/pac.routes').then((m) => m.PAC_PRESUPUESTAL_ROUTES),
      },

      // ── Activos Fijos (Sprint 11) ──
      {
        path: 'activos-fijos',
        loadChildren: () =>
          import('./features/activos-fijos/activo-fijo/activo-fijo.routes').then(
            (m) => m.ACTIVO_FIJO_ROUTES,
          ),
      },
      {
        path: 'polizas-seguro',
        loadChildren: () =>
          import('./features/activos-fijos/poliza-seguro/poliza-seguro.routes').then(
            (m) => m.POLIZA_SEGURO_ROUTES,
          ),
      },

      // ── Contratación (Sprint 11) ──
      {
        path: 'contratos',
        loadChildren: () =>
          import('./features/contratacion/contrato/contrato.routes').then((m) => m.CONTRATO_ROUTES),
      },
      {
        path: 'modalidades-contrato',
        loadChildren: () =>
          import('./features/contratacion/modalidad-contrato/modalidad-contrato.routes').then(
            (m) => m.MODALIDAD_CONTRATO_ROUTES,
          ),
      },
      {
        path: 'clausulas-plantilla',
        loadChildren: () =>
          import('./features/contratacion/clausula-plantilla/clausula-plantilla.routes').then(
            (m) => m.CLAUSULA_PLANTILLA_ROUTES,
          ),
      },

      // ── Talento Humano (Sprint 12) ──
      {
        path: 'empleados',
        loadChildren: () =>
          import('./features/talento-humano/empleado/empleado.routes').then((m) => m.EMPLEADO_ROUTES),
      },
      {
        path: 'evaluacion-programas',
        loadChildren: () =>
          import('./features/talento-humano/evaluacion-programa/evaluacion-programa.routes').then(
            (m) => m.EVALUACION_PROGRAMA_ROUTES,
          ),
      },

      // ── Nómina I (Sprint 13) ──
      {
        path: 'cargos',
        loadChildren: () => import('./features/nomina/cargo/cargo.routes').then((m) => m.CARGO_ROUTES),
      },
      {
        path: 'grupos-nomina',
        loadChildren: () =>
          import('./features/nomina/grupo-nomina/grupo-nomina.routes').then((m) => m.GRUPO_NOMINA_ROUTES),
      },
      {
        path: 'conceptos-nomina',
        loadChildren: () =>
          import('./features/nomina/concepto-nomina/concepto-nomina.routes').then(
            (m) => m.CONCEPTO_NOMINA_ROUTES,
          ),
      },
      {
        path: 'vinculaciones',
        loadChildren: () =>
          import('./features/nomina/vinculacion/vinculacion.routes').then((m) => m.VINCULACION_ROUTES),
      },
      {
        path: 'novedades',
        loadChildren: () =>
          import('./features/nomina/novedad-nomina/novedad-nomina.routes').then((m) => m.NOVEDAD_NOMINA_ROUTES),
      },
      {
        path: 'liquidaciones',
        loadChildren: () =>
          import('./features/nomina/liquidacion-nomina/liquidacion-nomina.routes').then(
            (m) => m.LIQUIDACION_NOMINA_ROUTES,
          ),
      },

      // ── Académico (Sprint 15) ──
      {
        path: 'programas',
        loadChildren: () =>
          import('./features/academico/programa/programa.routes').then((m) => m.PROGRAMA_ROUTES),
      },
      {
        path: 'asignaturas',
        loadChildren: () =>
          import('./features/academico/asignatura/asignatura.routes').then((m) => m.ASIGNATURA_ROUTES),
      },
      {
        path: 'grupos-academicos',
        loadChildren: () =>
          import('./features/academico/grupo-academico/grupo-academico.routes').then(
            (m) => m.GRUPO_ACADEMICO_ROUTES,
          ),
      },
      {
        path: 'carga-docente',
        loadChildren: () =>
          import('./features/academico/carga-academica/carga-academica.routes').then(
            (m) => m.CARGA_ACADEMICA_ROUTES,
          ),
      },

      // ── Jurídico (Sprint 15) ──
      {
        path: 'clasificaciones-falta',
        loadChildren: () =>
          import('./features/juridico/clasificacion-falta/clasificacion-falta.routes').then(
            (m) => m.CLASIFICACION_FALTA_ROUTES,
          ),
      },
      {
        path: 'faltas',
        loadChildren: () => import('./features/juridico/falta/falta.routes').then((m) => m.FALTA_ROUTES),
      },
      {
        path: 'procesos-disciplinarios',
        loadChildren: () =>
          import('./features/juridico/proceso-disciplinario/proceso-disciplinario.routes').then(
            (m) => m.PROCESO_DISCIPLINARIO_ROUTES,
          ),
      },

      // ── Reportes y cierres (Sprint 16) ──
      {
        path: 'reportes',
        loadChildren: () => import('./features/reportes/reportes.routes').then((m) => m.REPORTES_ROUTES),
      },

      // Módulos del menú aún sin pantalla → placeholder (se irán reemplazando por su CRUD real).
      // Los módulos ya construidos se registran ARRIBA, ANTES del comodín.
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: '**', loadComponent: placeholder },
    ],
  },
];
