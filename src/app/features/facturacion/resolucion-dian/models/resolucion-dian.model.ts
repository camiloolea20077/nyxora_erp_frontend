export interface ResolucionDianModel {
  id: number;
  numeroResolucion: string;
  prefijo: string | null;
  facturaInicial: number | null;
  facturaFinal: number | null;
  fechaInicial: string | null;
  fechaFinal: string | null;
  claveTecnica: string | null;
  descripcion: string | null;
  consecutivoActual: number | null;
  active: boolean;
  createdAt: string;
}

export interface ResolucionDianTableModel {
  id: number;
  numeroResolucion: string;
  prefijo: string | null;
  facturaInicial: number | null;
  facturaFinal: number | null;
  fechaFinal: string | null;
  consecutivoActual: number | null;
  active: boolean;
}

export interface CreateResolucionDianDto {
  numeroResolucion: string;
  prefijo: string | null;
  facturaInicial: number | null;
  facturaFinal: number | null;
  fechaInicial: string | null;
  fechaFinal: string | null;
  claveTecnica: string | null;
  descripcion: string | null;
}

export interface UpdateResolucionDianDto extends CreateResolucionDianDto {
  id: number;
  active?: boolean;
}
