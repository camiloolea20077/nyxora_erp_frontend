export interface BodegaModel {
  id: number;
  sedeId: number | null;
  centroCostoId: number | null;
  codigo: string;
  nombre: string;
  tipoAbastecimiento: string | null;
  direccion: string | null;
  latitud: string | null;
  longitud: string | null;
  permiteCompra: boolean | null;
  active: boolean;
  createdAt: string;
}

export interface BodegaTableModel {
  id: number;
  codigo: string;
  nombre: string;
  permiteCompra: boolean | null;
  active: boolean;
}

export interface CreateBodegaDto {
  sedeId: number | null;
  centroCostoId: number | null;
  codigo: string;
  nombre: string;
  tipoAbastecimiento: string | null;
  direccion: string | null;
  latitud: string | null;
  longitud: string | null;
  permiteCompra: boolean;
}

export interface UpdateBodegaDto extends CreateBodegaDto {
  id: number;
  active?: boolean;
}

export interface BodegaResponsableModel {
  id: number;
  bodegaId: number;
  terceroId: number;
  predeterminado: boolean | null;
  active: boolean;
}

export interface BodegaResponsableCreate {
  terceroId: number;
  predeterminado: boolean;
}
