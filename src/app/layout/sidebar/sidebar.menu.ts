export interface NavItem {
  label: string;
  icon: string; // clase PrimeIcons (p. ej. 'pi pi-box')
  route: string; // ruta absoluta ('/productos')
}

export interface NavGroup {
  label: string;
  icon: string;
  items: NavItem[];
}

/** Ítem fijo superior (fuera del acordeón). */
export const NAV_HOME: NavItem = { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' };

/** Menú lateral completo del ERP (acordeón por grupo). Rutas sin pantalla → placeholder. */
export const NAV_MENU: NavGroup[] = [
  {
    label: 'Administración',
    icon: 'pi pi-shield',
    items: [
      { label: 'Empresas', icon: 'pi pi-building-columns', route: '/empresas' },
      { label: 'Sedes', icon: 'pi pi-map', route: '/sedes' },
      { label: 'Usuarios', icon: 'pi pi-user', route: '/usuarios' },
      { label: 'Roles', icon: 'pi pi-id-card', route: '/roles' },
      { label: 'Permisos', icon: 'pi pi-lock', route: '/permisos' },
      { label: 'Vigencias', icon: 'pi pi-calendar', route: '/vigencias' },
      { label: 'Parámetros', icon: 'pi pi-sliders-h', route: '/parametros' },
      { label: 'Tipos de documento', icon: 'pi pi-file', route: '/tipos-documento' },
    ],
  },
  {
    label: 'Común',
    icon: 'pi pi-database',
    items: [
      { label: 'Terceros', icon: 'pi pi-users', route: '/terceros' },
      { label: 'Productos', icon: 'pi pi-box', route: '/productos' },
      { label: 'Categorías', icon: 'pi pi-tags', route: '/categorias' },
      { label: 'Impuestos', icon: 'pi pi-percentage', route: '/impuestos' },
      { label: 'Recursos', icon: 'pi pi-cog', route: '/recursos' },
      { label: 'Catálogos', icon: 'pi pi-book', route: '/catalogos' },
    ],
  },
  {
    label: 'Organización',
    icon: 'pi pi-sitemap',
    items: [
      { label: 'Centros de costo', icon: 'pi pi-sitemap', route: '/centros-costo' },
      { label: 'Dependencias', icon: 'pi pi-share-alt', route: '/dependencias' },
      { label: 'Proyectos', icon: 'pi pi-briefcase', route: '/proyectos' },
    ],
  },
  {
    label: 'Inventario',
    icon: 'pi pi-box',
    items: [
      { label: 'Bodegas', icon: 'pi pi-building', route: '/bodegas' },
      { label: 'Ubicaciones', icon: 'pi pi-map-marker', route: '/ubicaciones' },
      { label: 'Lotes', icon: 'pi pi-clone', route: '/lotes' },
      { label: 'Marcas', icon: 'pi pi-bookmark', route: '/marcas' },
      { label: 'Movimientos', icon: 'pi pi-sort-alt', route: '/movimientos-inventario' },
      { label: 'Existencias', icon: 'pi pi-chart-bar', route: '/saldos-inventario' },
    ],
  },
  {
    label: 'Compras',
    icon: 'pi pi-shopping-cart',
    items: [
      { label: 'Órdenes de compra', icon: 'pi pi-shopping-cart', route: '/ordenes-compra' },
      { label: 'Recepciones', icon: 'pi pi-inbox', route: '/recepciones' },
    ],
  },
  {
    label: 'Facturación',
    icon: 'pi pi-file',
    items: [
      { label: 'Facturas', icon: 'pi pi-file', route: '/facturas' },
      { label: 'Resoluciones DIAN', icon: 'pi pi-verified', route: '/resoluciones-dian' },
    ],
  },
  {
    label: 'Cartera',
    icon: 'pi pi-credit-card',
    items: [
      { label: 'Cuentas por cobrar', icon: 'pi pi-money-bill', route: '/cuentas-cobrar' },
      { label: 'Acuerdos de pago', icon: 'pi pi-calendar-plus', route: '/acuerdos-pago' },
    ],
  },
  {
    label: 'Caja',
    icon: 'pi pi-wallet',
    items: [
      { label: 'Cajas', icon: 'pi pi-wallet', route: '/cajas' },
      { label: 'Recibos', icon: 'pi pi-receipt', route: '/recibos' },
      { label: 'Arqueos', icon: 'pi pi-check-square', route: '/arqueos' },
    ],
  },
  {
    label: 'Tesorería',
    icon: 'pi pi-building-columns',
    items: [
      { label: 'Cuentas bancarias', icon: 'pi pi-building-columns', route: '/cuentas-bancarias' },
      { label: 'Chequeras', icon: 'pi pi-book', route: '/chequeras' },
      { label: 'Egresos', icon: 'pi pi-arrow-up', route: '/egresos' },
      { label: 'Conciliación', icon: 'pi pi-sync', route: '/conciliacion' },
    ],
  },
  {
    label: 'Cuentas por pagar',
    icon: 'pi pi-money-bill',
    items: [
      { label: 'Facturas proveedor', icon: 'pi pi-file', route: '/facturas-proveedor' },
      { label: 'Obligaciones', icon: 'pi pi-flag', route: '/obligaciones' },
      { label: 'Retenciones', icon: 'pi pi-percentage', route: '/retenciones' },
    ],
  },
  {
    label: 'Contabilidad',
    icon: 'pi pi-book',
    items: [
      { label: 'Plan de cuentas', icon: 'pi pi-list', route: '/cuentas' },
      { label: 'Periodos', icon: 'pi pi-calendar', route: '/periodos-contables' },
      { label: 'Comprobantes', icon: 'pi pi-file-edit', route: '/comprobantes' },
      { label: 'Saldos contables', icon: 'pi pi-wallet', route: '/saldos' },
    ],
  },
  {
    label: 'Costos',
    icon: 'pi pi-chart-pie',
    items: [
      { label: 'Recursos de costeo', icon: 'pi pi-cog', route: '/recursos-costeo' },
      { label: 'Drivers', icon: 'pi pi-sliders-h', route: '/drivers' },
    ],
  },
  {
    label: 'Presupuesto',
    icon: 'pi pi-chart-line',
    items: [
      { label: 'Rubros', icon: 'pi pi-list', route: '/rubros-presupuestales' },
      { label: 'Fuentes de financiamiento', icon: 'pi pi-wallet', route: '/fuentes-financiamiento' },
      { label: 'CPC', icon: 'pi pi-book', route: '/cpc' },
      { label: 'Ejecución (CDP→pago)', icon: 'pi pi-check-circle', route: '/ejecucion-presupuestal' },
      { label: 'PAC', icon: 'pi pi-calendar', route: '/pac-presupuestal' },
    ],
  },
  {
    label: 'Activos Fijos',
    icon: 'pi pi-desktop',
    items: [
      { label: 'Activos', icon: 'pi pi-desktop', route: '/activos-fijos' },
      { label: 'Pólizas de seguro', icon: 'pi pi-shield', route: '/polizas-seguro' },
    ],
  },
  {
    label: 'Contratación',
    icon: 'pi pi-file-edit',
    items: [
      { label: 'Contratos', icon: 'pi pi-file-edit', route: '/contratos' },
      { label: 'Modalidades', icon: 'pi pi-list', route: '/modalidades-contrato' },
      { label: 'Plantillas de cláusula', icon: 'pi pi-book', route: '/clausulas-plantilla' },
    ],
  },
  {
    label: 'Talento Humano',
    icon: 'pi pi-id-card',
    items: [
      { label: 'Empleados', icon: 'pi pi-users', route: '/empleados' },
      { label: 'Programas de evaluación', icon: 'pi pi-star', route: '/evaluacion-programas' },
    ],
  },
  {
    label: 'Nómina',
    icon: 'pi pi-dollar',
    items: [
      { label: 'Cargos', icon: 'pi pi-briefcase', route: '/cargos' },
      { label: 'Grupos de nómina', icon: 'pi pi-users', route: '/grupos-nomina' },
      { label: 'Conceptos', icon: 'pi pi-list', route: '/conceptos-nomina' },
      { label: 'Vinculaciones', icon: 'pi pi-id-card', route: '/vinculaciones' },
      { label: 'Novedades', icon: 'pi pi-bell', route: '/novedades' },
      { label: 'Liquidaciones', icon: 'pi pi-dollar', route: '/liquidaciones' },
    ],
  },
  {
    label: 'Académico',
    icon: 'pi pi-graduation-cap',
    items: [
      { label: 'Programas', icon: 'pi pi-book', route: '/programas' },
      { label: 'Asignaturas', icon: 'pi pi-list', route: '/asignaturas' },
      { label: 'Grupos', icon: 'pi pi-users', route: '/grupos-academicos' },
      { label: 'Carga docente', icon: 'pi pi-calendar', route: '/carga-docente' },
    ],
  },
  {
    label: 'Jurídico',
    icon: 'pi pi-flag',
    items: [
      { label: 'Procesos disciplinarios', icon: 'pi pi-flag', route: '/procesos-disciplinarios' },
      { label: 'Faltas', icon: 'pi pi-exclamation-triangle', route: '/faltas' },
      { label: 'Clasificaciones de falta', icon: 'pi pi-tags', route: '/clasificaciones-falta' },
    ],
  },
  {
    label: 'Reportes',
    icon: 'pi pi-chart-bar',
    items: [
      { label: 'Balance general', icon: 'pi pi-chart-bar', route: '/reportes/balance-general' },
      { label: 'Estado de resultados', icon: 'pi pi-chart-line', route: '/reportes/estado-resultados' },
      { label: 'Cartera', icon: 'pi pi-money-bill', route: '/reportes/cartera' },
      { label: 'Ejecución presupuestal', icon: 'pi pi-percentage', route: '/reportes/ejecucion-presupuestal' },
      { label: 'Cierre de periodo', icon: 'pi pi-lock', route: '/reportes/cierre-periodo' },
    ],
  },
];

function cleanPath(url: string): string {
  return url.split('?')[0].split('#')[0];
}

/** Título de la sección a partir de la URL (para topbar y placeholder). */
export function findNavTitle(url: string): string {
  const path = cleanPath(url);
  if (path === '/' || path.startsWith('/dashboard')) return NAV_HOME.label;
  for (const g of NAV_MENU) {
    for (const it of g.items) {
      if (path === it.route || path.startsWith(it.route + '/')) return it.label;
    }
  }
  return 'Nyxora ERP';
}

/** Grupo que contiene la ruta actual (para auto-expandir el acordeón). */
export function findNavGroup(url: string): string | null {
  const path = cleanPath(url);
  for (const g of NAV_MENU) {
    for (const it of g.items) {
      if (path === it.route || path.startsWith(it.route + '/')) return g.label;
    }
  }
  return null;
}
