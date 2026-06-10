export interface OrdenCompraLineaModel {
  id: number;
  ordenCompraId: number;
  productoId: number | null;
  productoVarianteId: number | null;
  descripcion: string | null;
  cantidad: number | null;
  unidadMedidaId: number | null;
  valorUnitario: number | null;
  descuentoPorcentaje: number | null;
  descuentoValor: number | null;
  impuestoId: number | null;
  impuestoPorcentaje: number | null;
  impuestoValor: number | null;
  subtotal: number | null;
  total: number | null;
  cantidadRecibida: number | null;
  cantidadPendiente: number | null;
  centroCostoId: number | null;
}

export interface OrdenCompraModel {
  id: number;
  sedeId: number | null;
  vigenciaId: number | null;
  tipoDocumentoId: number | null;
  numero: string | null;
  proveedorId: number | null;
  bodegaId: number | null;
  centroCostoId: number | null;
  condicionPagoId: number | null;
  fecha: string | null;
  fechaEntrega: string | null;
  observaciones: string | null;
  estado: string;
  subtotal: number | null;
  descuento: number | null;
  impuestos: number | null;
  total: number | null;
  active: boolean;
  createdAt: string;
  lineas: OrdenCompraLineaModel[];
}

export interface OrdenCompraTableModel {
  id: number;
  numero: string | null;
  proveedorId: number | null;
  fecha: string | null;
  estado: string;
  total: number | null;
  active: boolean;
}

export interface CreateOrdenCompraLineaDto {
  productoId: number | null;
  descripcion: string | null;
  cantidad: number | null;
  unidadMedidaId: number | null;
  valorUnitario: number | null;
  descuentoPorcentaje: number | null;
  impuestoId: number | null;
  centroCostoId: number | null;
}

export interface CreateOrdenCompraDto {
  sedeId: number | null;
  vigenciaId: number | null;
  tipoDocumentoId: number | null;
  numero: string | null;
  proveedorId: number | null;
  bodegaId: number | null;
  centroCostoId: number | null;
  condicionPagoId: number | null;
  fecha: string | null;
  fechaEntrega: string | null;
  observaciones: string | null;
  lineas: CreateOrdenCompraLineaDto[];
}

export interface UpdateOrdenCompraDto extends CreateOrdenCompraDto {
  id: number;
  active?: boolean;
}
