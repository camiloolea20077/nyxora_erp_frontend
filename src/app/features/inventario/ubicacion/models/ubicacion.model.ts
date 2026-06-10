export interface UbicacionModel {
  id: number;
  bodegaId: number | null;
  ubicacionPadreId: number | null;
  codigo: string;
  nombre: string;
  pasillo: number | null;
  altura: number | null;
  posicion: number | null;
  izquierda: number | null;
  derecha: number | null;
  nivel: number | null;
  active: boolean;
  createdAt: string;
}

export interface UbicacionTableModel {
  id: number;
  bodegaId: number | null;
  ubicacionPadreId: number | null;
  codigo: string;
  nombre: string;
  active: boolean;
}

export interface CreateUbicacionDto {
  bodegaId: number | null;
  ubicacionPadreId: number | null;
  codigo: string;
  nombre: string;
  pasillo: number | null;
  altura: number | null;
  posicion: number | null;
}

export interface UpdateUbicacionDto extends CreateUbicacionDto {
  id: number;
  active?: boolean;
}
