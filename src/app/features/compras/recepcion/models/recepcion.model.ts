export interface RecepcionLineaModel {
  id: number;
  recepcionId: number;
  ordenCompraLineaId: number | null;
  productoId: number | null;
  productoVarianteId: number | null;
  loteId: number | null;
  ubicacionId: number | null;
  cantidadRecibida: number | null;
  costoUnitario: number | null;
}

export interface RecepcionModel {
  id: number;
  ordenCompraId: number | null;
  bodegaId: number | null;
  tipoDocumentoId: number | null;
  numero: string | null;
  fecha: string | null;
  estado: string;
  observaciones: string | null;
  active: boolean;
  createdAt: string;
  lineas: RecepcionLineaModel[];
}

export interface RecepcionTableModel {
  id: number;
  ordenCompraId: number | null;
  numero: string | null;
  fecha: string | null;
  estado: string;
  active: boolean;
}

export interface CreateRecepcionLineaDto {
  ordenCompraLineaId: number | null;
  productoId: number | null;
  productoVarianteId: number | null;
  loteId: number | null;
  ubicacionId: number | null;
  cantidadRecibida: number | null;
  costoUnitario: number | null;
}

export interface CreateRecepcionDto {
  ordenCompraId: number | null;
  bodegaId: number | null;
  tipoDocumentoId: number | null;
  numero: string | null;
  fecha: string | null;
  observaciones: string | null;
  lineas: CreateRecepcionLineaDto[];
}

export interface ConfirmarRecepcionDto {
  cuentaInventarioId: number | null;
  cuentaContrapartidaId: number | null;
  periodoContableId: number | null;
}
