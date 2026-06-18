export interface CpcModel {
  id: number;
  vigenciaId: number | null;
  cpcPadreId: number | null;
  codigo: string;
  nombre: string;
  manejaMovimiento: boolean;
  active: boolean;
  createdAt: string;
}

export interface CpcTableModel {
  id: number;
  cpcPadreId: number | null;
  codigo: string;
  nombre: string;
  manejaMovimiento: boolean;
  active: boolean;
}

export interface CreateCpcDto {
  vigenciaId: number | null;
  cpcPadreId: number | null;
  codigo: string;
  nombre: string;
  manejaMovimiento: boolean;
}

export interface UpdateCpcDto extends CreateCpcDto {
  id: number;
}
