export interface CategoriaModel {
  id: number;
  categoriaPadreId: number | null;
  codigo: string;
  nombre: string;
  tipoProducto: string | null;
  metodoCosteo: string | null;
  izquierda: number | null;
  derecha: number | null;
  nivel: number | null;
  active: boolean;
  createdAt: string;
}

export interface CategoriaTableModel {
  id: number;
  categoriaPadreId: number | null;
  codigo: string;
  nombre: string;
  tipoProducto: string | null;
  active: boolean;
}

export interface CreateCategoriaDto {
  categoriaPadreId: number | null;
  codigo: string;
  nombre: string;
  tipoProducto: string | null;
  metodoCosteo: string | null;
}

export interface UpdateCategoriaDto extends CreateCategoriaDto {
  id: number;
  active?: boolean;
}
