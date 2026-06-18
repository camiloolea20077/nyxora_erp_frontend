export interface ModalidadContratoModel {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  active: boolean;
  createdAt: string;
}

export interface ModalidadContratoTableModel {
  id: number;
  codigo: string;
  nombre: string;
  active: boolean;
}

export interface CreateModalidadContratoDto {
  codigo: string;
  nombre: string;
  descripcion: string | null;
}

export interface UpdateModalidadContratoDto extends CreateModalidadContratoDto {
  id: number;
}
