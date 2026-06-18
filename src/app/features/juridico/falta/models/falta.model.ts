export interface FaltaModel {
  id: number;
  clasificacionFaltaId: number | null;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  caducidadDias: number | null;
  politica: string | null;
  active: boolean;
  createdAt: string;
}

export interface FaltaTableModel {
  id: number;
  codigo: string;
  nombre: string;
  active: boolean;
}

export interface CreateFaltaDto {
  clasificacionFaltaId: number | null;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  caducidadDias: number | null;
  politica: string | null;
}

export interface UpdateFaltaDto extends CreateFaltaDto {
  id: number;
  active?: boolean;
}
