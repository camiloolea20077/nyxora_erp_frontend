export interface ActivoFijoResponsableModel {
  id: number;
  terceroId: number;
  terceroNombre: string | null;
  active: boolean;
}

export interface ActivoFijoPolizaModel {
  id: number;
  polizaSeguroId: number;
  numero: string | null;
  tipo: string | null;
  valorAsegurado: number | null;
}

export interface ActivoFijoModel {
  id: number;
  productoId: number | null;
  codigo: string;
  codigoUnspsc: string | null;
  codigoBarra: string | null;
  nombre: string;
  descripcion: string | null;
  marcaId: number | null;
  unidadMayorId: number | null;
  numeroSerie: string | null;
  modelo: string | null;
  bodegaId: number | null;
  centroCostoId: number | null;
  proveedorId: number | null;
  proveedorNombre: string | null;
  numeroFactura: string | null;
  fechaFactura: string | null;
  valorCompra: number | null;
  valorSalvamento: number | null;
  porcentajeSalvamento: number | null;
  metodoDepreciacion: string | null;
  tipoDepreciacion: string | null;
  valorDepreciacion: number | null;
  deterioro: number | null;
  valorActual: number | null;
  avaluo: number | null;
  vidaUtil: number | null;
  mesesDepreciados: number | null;
  capitalizado: number | null;
  estadoActivo: string | null;
  fechaSalidaServicio: string | null;
  active: boolean;
  createdAt: string;
  responsables: ActivoFijoResponsableModel[];
  polizas: ActivoFijoPolizaModel[];
}

export interface ActivoFijoTableModel {
  id: number;
  codigo: string;
  nombre: string;
  numeroSerie: string | null;
  valorCompra: number | null;
  valorActual: number | null;
  estadoActivo: string | null;
  active: boolean;
}

export interface CreateActivoFijoDto {
  codigo: string;
  nombre: string;
  productoId: number | null;
  codigoUnspsc: string | null;
  codigoBarra: string | null;
  descripcion: string | null;
  marcaId: number | null;
  unidadMayorId: number | null;
  numeroSerie: string | null;
  modelo: string | null;
  bodegaId: number | null;
  centroCostoId: number | null;
  proveedorId: number | null;
  numeroFactura: string | null;
  fechaFactura: string | null;
  valorCompra: number | null;
  valorSalvamento: number | null;
  porcentajeSalvamento: number | null;
  metodoDepreciacion: string | null;
  tipoDepreciacion: string | null;
  deterioro: number | null;
  avaluo: number | null;
  vidaUtil: number | null;
  capitalizado: number | null;
  estadoActivo: string | null;
  fechaSalidaServicio: string | null;
}

export interface UpdateActivoFijoDto extends CreateActivoFijoDto {
  id: number;
}

export interface AsignarResponsableDto {
  terceroId: number;
}

export interface AsignarPolizaDto {
  polizaSeguroId: number;
}

export interface DepreciacionModel {
  id: number;
  activoFijoId: number;
  fechaAplicacion: string | null;
  valorDepreciacion: number | null;
  cuotaDepreciacion: number | null;
  periodoAmortizacion: number | null;
  unidadesProducidas: number | null;
  createdAt: string;
}

export interface DepreciacionTableModel {
  id: number;
  fechaAplicacion: string | null;
  valorDepreciacion: number | null;
  periodoAmortizacion: number | null;
}

export interface CreateDepreciacionDto {
  activoFijoId: number;
  fechaAplicacion: string | null;
  valorDepreciacion: number | null;
  cuotaDepreciacion: number | null;
  periodoAmortizacion: number | null;
  unidadesProducidas: number | null;
}
