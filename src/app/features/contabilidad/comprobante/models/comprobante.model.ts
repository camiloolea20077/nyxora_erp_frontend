export interface MovimientoModel {
  id: number;
  comprobanteId: number;
  cuentaId: number | null;
  terceroId: number | null;
  centroCostoId: number | null;
  proyectoId: number | null;
  recursoId: number | null;
  descripcion: string | null;
  debito: number | null;
  credito: number | null;
  valorBase: number | null;
  impuestoId: number | null;
  porcentajeImpuesto: number | null;
  valorTrm: number | null;
  valorDolar: number | null;
}

export interface ComprobanteModel {
  id: number;
  periodoContableId: number | null;
  tipoDocumentoId: number | null;
  numero: string | null;
  fecha: string | null;
  descripcion: string | null;
  estado: string;
  totalDebito: number | null;
  totalCredito: number | null;
  origenModulo: string | null;
  origenId: number | null;
  active: boolean;
  createdAt: string;
  movimientos: MovimientoModel[];
}

export interface ComprobanteTableModel {
  id: number;
  numero: string | null;
  fecha: string | null;
  descripcion: string | null;
  estado: string;
  totalDebito: number | null;
  totalCredito: number | null;
  active: boolean;
}

export interface CreateMovimientoDto {
  cuentaId: number | null;
  centroCostoId: number | null;
  descripcion: string | null;
  debito: number | null;
  credito: number | null;
}

export interface CreateComprobanteDto {
  periodoContableId: number | null;
  tipoDocumentoId: number | null;
  numero: string | null;
  fecha: string | null;
  descripcion: string | null;
  movimientos: CreateMovimientoDto[];
}
