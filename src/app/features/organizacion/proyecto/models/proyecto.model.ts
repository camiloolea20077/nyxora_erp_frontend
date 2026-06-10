export interface ProyectoModel {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  programaId: number | null;
  fechaInicio: string | null;
  fechaFinal: string | null;
  active: boolean;
  createdAt: string;
}

export interface ProyectoTableModel {
  id: number;
  codigo: string;
  nombre: string;
  fechaInicio: string | null;
  fechaFinal: string | null;
  active: boolean;
}

export interface CreateProyectoDto {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  fechaInicio: string | null;
  fechaFinal: string | null;
}

export interface UpdateProyectoDto extends CreateProyectoDto {
  id: number;
  active?: boolean;
}
