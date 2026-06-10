export interface RecursoModel {
  id: number;
  codigo: string;
  nombre: string;
  tipoRecurso: string | null;
  driver: string | null;
  costoAdicional: boolean | null;
  descripcion: string | null;
  active: boolean;
  createdAt: string;
}

export interface RecursoTableModel {
  id: number;
  codigo: string;
  nombre: string;
  tipoRecurso: string | null;
  active: boolean;
}

export interface CreateRecursoDto {
  codigo: string;
  nombre: string;
  tipoRecurso: string | null;
  driver: string | null;
  costoAdicional: boolean;
  descripcion: string | null;
}

export interface UpdateRecursoDto extends CreateRecursoDto {
  id: number;
  active?: boolean;
}
