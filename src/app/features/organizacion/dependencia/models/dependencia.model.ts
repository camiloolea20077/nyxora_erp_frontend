export interface DependenciaModel {
  id: number;
  centroCostoId: number | null;
  dependenciaPadreId: number | null;
  codigo: string;
  nombre: string;
  ubicacion: string | null;
  latitud: string | null;
  longitud: string | null;
  izquierda: number | null;
  derecha: number | null;
  nivel: number | null;
  active: boolean;
  createdAt: string;
}

export interface DependenciaTableModel {
  id: number;
  centroCostoId: number | null;
  dependenciaPadreId: number | null;
  codigo: string;
  nombre: string;
  active: boolean;
}

export interface CreateDependenciaDto {
  centroCostoId: number | null;
  dependenciaPadreId: number | null;
  codigo: string;
  nombre: string;
  ubicacion: string | null;
  latitud: string | null;
  longitud: string | null;
}

export interface UpdateDependenciaDto extends CreateDependenciaDto {
  id: number;
  active?: boolean;
}
