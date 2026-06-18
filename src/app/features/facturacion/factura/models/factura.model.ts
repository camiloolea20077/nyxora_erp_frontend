export interface FacturaLineaModel {
  id: number;
  facturaId: number;
  productoId: number | null;
  productoVarianteId: number | null;
  descripcion: string | null;
  cantidad: number | null;
  unidadMedidaId: number | null;
  valorUnitario: number | null;
  descuentoPorcentaje: number | null;
  descuentoValor: number | null;
  subtotal: number | null;
  impuestoId: number | null;
  porcentajeImpuesto: number | null;
  valorImpuesto: number | null;
  discriminaIva: boolean;
  total: number | null;
  bodegaId: number | null;
  loteId: number | null;
  centroCostoId: number | null;
}

export interface FacturaModel {
  id: number;
  sedeId: number | null;
  vigenciaId: number | null;
  tipoDocumentoId: number | null;
  resolucionDianId: number | null;
  numero: string | null;
  clienteId: number | null;
  bodegaId: number | null;
  centroCostoId: number | null;
  condicionPagoId: number | null;
  fecha: string | null;
  fechaVencimiento: string | null;
  observaciones: string | null;
  estado: string;
  subtotal: number | null;
  descuento: number | null;
  impuestos: number | null;
  total: number | null;
  active: boolean;
  createdAt: string;
  lineas: FacturaLineaModel[];
}

export interface FacturaTableModel {
  id: number;
  numero: string | null;
  clienteId: number | null;
  fecha: string | null;
  estado: string;
  total: number | null;
  active: boolean;
}

export interface CreateFacturaLineaDto {
  productoId: number | null;
  productoVarianteId: number | null;
  descripcion: string | null;
  cantidad: number | null;
  unidadMedidaId: number | null;
  valorUnitario: number | null;
  descuentoPorcentaje: number | null;
  descuentoValor: number | null;
  impuestoId: number | null;
  porcentajeImpuesto: number | null;
  valorImpuesto: number | null;
  discriminaIva: boolean;
  bodegaId: number | null;
  loteId: number | null;
  centroCostoId: number | null;
}

export interface CreateFacturaDto {
  sedeId: number | null;
  vigenciaId: number | null;
  tipoDocumentoId: number | null;
  resolucionDianId: number | null;
  numero: string | null;
  clienteId: number | null;
  bodegaId: number | null;
  centroCostoId: number | null;
  condicionPagoId: number | null;
  fecha: string | null;
  fechaVencimiento: string | null;
  observaciones: string | null;
  lineas: CreateFacturaLineaDto[];
}

export interface UpdateFacturaDto extends CreateFacturaDto {
  id: number;
  active?: boolean;
}

/** Cuentas/periodo opcionales para generar el asiento contable al emitir. */
export interface EmitirFacturaDto {
  cuentaClienteId: number | null;
  cuentaIngresoId: number | null;
  cuentaImpuestoId: number | null;
  periodoContableId: number | null;
}

export interface FacturaDianModel {
  id: number;
  facturaId: number;
  cufe: string | null;
  estadoDian: string | null;
  fechaAcuse: string | null;
  comentarioAcuse: string | null;
  createdAt: string;
}

export interface RegistrarFacturaDianDto {
  cufe: string | null;
  estadoDian: string | null;
  fechaAcuse: string | null;
  comentarioAcuse: string | null;
}
