export interface MarcaModel {
  id: number;
  codigo: string;
  nombre: string;
  active: boolean;
  createdAt: string;
}

export interface MarcaTableModel {
  id: number;
  codigo: string;
  nombre: string;
  active: boolean;
}

export interface CreateMarcaDto {
  codigo: string;
  nombre: string;
}

export interface UpdateMarcaDto extends CreateMarcaDto {
  id: number;
  active?: boolean;
}
