export interface CajaModel {
  id: number;
  sedeId: number | null;
  usuarioId: number | null;
  codigo: string;
  nombre: string | null;
  estado: string;
  saldoInicial: number | null;
  fechaApertura: string | null;
  fechaCierre: string | null;
  active: boolean;
  createdAt: string;
}

export interface CajaTableModel {
  id: number;
  codigo: string;
  nombre: string | null;
  estado: string;
  saldoInicial: number | null;
  active: boolean;
}

export interface CreateCajaDto {
  codigo: string;
  nombre: string | null;
  sedeId: number | null;
  usuarioId: number | null;
}

export interface UpdateCajaDto extends CreateCajaDto {
  id: number;
}

export interface AbrirCajaDto {
  saldoInicial: number | null;
}
