export interface CentroCostoModel {
  id: number;
  sedeId: number | null;
  centroCostoPadreId: number | null;
  codigo: string;
  nombre: string;
  tipoCentroCosto: string | null;
  claseCentroCosto: string | null;
  esObservacion: boolean | null;
  manejaPlanFinanciero: boolean | null;
  terceroId: number | null;
  direccion: string | null;
  unidadNegocioId: number | null;
  izquierda: number | null;
  derecha: number | null;
  nivel: number | null;
  active: boolean;
  createdAt: string;
}

export interface CentroCostoTableModel {
  id: number;
  centroCostoPadreId: number | null;
  codigo: string;
  nombre: string;
  esObservacion: boolean | null;
  active: boolean;
}

export interface CreateCentroCostoDto {
  sedeId: number | null;
  centroCostoPadreId: number | null;
  codigo: string;
  nombre: string;
  tipoCentroCosto: string | null;
  claseCentroCosto: string | null;
  esObservacion: boolean;
  manejaPlanFinanciero: boolean;
  direccion: string | null;
}

export interface UpdateCentroCostoDto extends CreateCentroCostoDto {
  id: number;
  active?: boolean;
}
