export interface ComprobanteEgresoModel {
  id: number;
  cuentaBancariaId: number | null;
  beneficiarioId: number | null;
  tipoDocumentoId: number | null;
  formaPagoId: number | null;
  numero: string | null;
  fecha: string | null;
  valor: number | null;
  estado: string;
  numeroCheque: string | null;
  descripcion: string | null;
  origenModulo: string | null;
  origenId: number | null;
  active: boolean;
  createdAt: string;
}

export interface ComprobanteEgresoTableModel {
  id: number;
  cuentaBancariaId: number | null;
  beneficiarioId: number | null;
  numero: string | null;
  fecha: string | null;
  valor: number | null;
  estado: string;
  active: boolean;
}

export interface CreateEgresoDto {
  cuentaBancariaId: number | null;
  beneficiarioId: number | null;
  tipoDocumentoId: number | null;
  formaPagoId: number | null;
  numero: string | null;
  fecha: string | null;
  valor: number | null;
  numeroCheque: string | null;
  descripcion: string | null;
  obligacionPagoId: number | null;
}

export interface GirarEgresoDto {
  cuentaBancoId: number | null;
  cuentaCxpId: number | null;
  periodoContableId: number | null;
}
