export interface PeriodoModel {
  id: number;
  vigenciaId: number;
  anio: number;
  mes: number;
  estado: string;
}

export interface PeriodoTableModel {
  id: number;
  vigenciaId: number;
  anio: number;
  mes: number;
  estado: string;
}

export interface CreatePeriodoDto {
  vigenciaId: number;
  anio: number;
  mes: number;
}
