export interface CargoModel {
  id: number;
  codigo: string;
  nombre: string;
  nivelCargo: string | null;
  grado: string | null;
  tipoRemuneracion: string | null;
  sueldoBasico: number | null;
  sueldoMaximo: number | null;
  mision: string | null;
  descripcion: string | null;
  active: boolean;
  createdAt: string;
}

export interface CargoTableModel {
  id: number;
  codigo: string;
  nombre: string;
  nivelCargo: string | null;
  sueldoBasico: number | null;
  active: boolean;
}

export interface CreateCargoDto {
  codigo: string;
  nombre: string;
  nivelCargo: string | null;
  grado: string | null;
  tipoRemuneracion: string | null;
  sueldoBasico: number | null;
  sueldoMaximo: number | null;
  mision: string | null;
  descripcion: string | null;
}

export interface UpdateCargoDto extends CreateCargoDto {
  id: number;
  active?: boolean;
}
