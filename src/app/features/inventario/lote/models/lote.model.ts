export interface LoteModel {
  id: number;
  productoVarianteId: number | null;
  codigo: string;
  nombre: string | null;
  fechaFabricado: string | null;
  fechaVencimiento: string | null;
  active: boolean;
  createdAt: string;
}

export interface LoteTableModel {
  id: number;
  codigo: string;
  nombre: string | null;
  fechaVencimiento: string | null;
  active: boolean;
}

export interface CreateLoteDto {
  productoVarianteId: number | null;
  codigo: string;
  nombre: string | null;
  fechaFabricado: string | null;
  fechaVencimiento: string | null;
}

export interface UpdateLoteDto extends CreateLoteDto {
  id: number;
  active?: boolean;
}
