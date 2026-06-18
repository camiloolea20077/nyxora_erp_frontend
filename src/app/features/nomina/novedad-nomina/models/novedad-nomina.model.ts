export interface NovedadNominaModel {
  id: number;
  vinculacionId: number;
  conceptoNominaId: number;
  conceptoNombre: string | null;
  terceroId: number | null;
  descripcion: string | null;
  cantidadValor: number | null;
  fechaInicial: string | null;
  fechaFinal: string | null;
  fechaAplicada: string | null;
  numeroCuota: number | null;
  dias: number | null;
  tipoAusentismo: string | null;
  tipoEmbargo: string | null;
  expediente: string | null;
  demandante: string | null;
  bancoId: number | null;
  numeroCuentaBancaria: string | null;
  estadoNovedad: string | null;
  anulado: boolean | null;
  active: boolean;
  createdAt: string;
}

export interface NovedadNominaTableModel {
  id: number;
  vinculacionId: number;
  empleadoNombre: string | null;
  conceptoNombre: string | null;
  cantidadValor: number | null;
  estadoNovedad: string | null;
  anulado: boolean | null;
}

export interface CreateNovedadNominaDto {
  vinculacionId: number;
  conceptoNominaId: number;
  terceroId: number | null;
  descripcion: string | null;
  cantidadValor: number | null;
  fechaInicial: string | null;
  fechaFinal: string | null;
  fechaAplicada: string | null;
  numeroCuota: number | null;
  dias: number | null;
  tipoAusentismo: string | null;
  tipoEmbargo: string | null;
  expediente: string | null;
  demandante: string | null;
  bancoId: number | null;
  numeroCuentaBancaria: string | null;
  estadoNovedad: string | null;
}

export interface UpdateNovedadNominaDto extends CreateNovedadNominaDto {
  id: number;
  active?: boolean;
}
