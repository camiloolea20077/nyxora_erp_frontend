export interface FuenteFinanciamientoModel {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  tipoRecurso: string | null;
  active: boolean;
  createdAt: string;
}

export interface FuenteFinanciamientoTableModel {
  id: number;
  codigo: string;
  nombre: string;
  tipoRecurso: string | null;
  active: boolean;
}

export interface CreateFuenteFinanciamientoDto {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  tipoRecurso: string | null;
}

export interface UpdateFuenteFinanciamientoDto extends CreateFuenteFinanciamientoDto {
  id: number;
}
