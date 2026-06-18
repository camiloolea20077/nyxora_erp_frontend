export interface ClasificacionFaltaModel {
  id: number;
  codigo: string;
  nombre: string;
  active: boolean;
  createdAt: string;
}

export interface ClasificacionFaltaTableModel {
  id: number;
  codigo: string;
  nombre: string;
  active: boolean;
}

export interface CreateClasificacionFaltaDto {
  codigo: string;
  nombre: string;
}

export interface UpdateClasificacionFaltaDto extends CreateClasificacionFaltaDto {
  id: number;
  active?: boolean;
}
