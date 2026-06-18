export interface ObligacionPagoRetencionModel {
  id: number;
  obligacionPagoId: number;
  impuestoId: number | null;
  base: number | null;
  limite: string | null;
  valor: number | null;
}

export interface ObligacionPagoModel {
  id: number;
  proveedorId: number | null;
  facturaProveedorId: number | null;
  cuentaId: number | null;
  numero: string | null;
  fecha: string | null;
  fechaVencimiento: string | null;
  valorTotal: number | null;
  saldo: number | null;
  estado: string;
  active: boolean;
  createdAt: string;
  retenciones: ObligacionPagoRetencionModel[];
}

export interface ObligacionPagoTableModel {
  id: number;
  proveedorId: number | null;
  facturaProveedorId: number | null;
  numero: string | null;
  fecha: string | null;
  fechaVencimiento: string | null;
  valorTotal: number | null;
  saldo: number | null;
  estado: string;
  active: boolean;
}

export interface CreateObligacionPagoRetencionDto {
  impuestoId: number | null;
  base: number | null;
  limite: string | null;
  valor: number | null;
}

export interface CreateObligacionPagoDto {
  proveedorId: number | null;
  facturaProveedorId: number | null;
  cuentaId: number | null;
  numero: string | null;
  fecha: string | null;
  fechaVencimiento: string | null;
  valorTotal: number | null;
  retenciones: CreateObligacionPagoRetencionDto[];
}
