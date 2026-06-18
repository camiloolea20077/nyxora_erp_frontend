export interface VinculacionModel {
  id: number;
  empleadoId: number;
  empleadoNombre: string | null;
  cargoId: number | null;
  cargoNombre: string | null;
  grupoNominaId: number | null;
  codigo: string | null;
  fecha: string | null;
  fechaFin: string | null;
  tipoVinculacion: string | null;
  tipoContrato: string | null;
  sueldo: number | null;
  horaTrabajo: number | null;
  periodoPrueba: boolean | null;
  fechaFinPeriodoPrueba: string | null;
  frecuenciaPago: string | null;
  jefeId: number | null;
  sedeId: number | null;
  dependenciaId: number | null;
  municipioVinculacionId: number | null;
  tipoCotizante: string | null;
  estadoVinculacion: string | null;
  objeto: string | null;
  temporal: boolean | null;
  active: boolean;
  createdAt: string;
}

export interface VinculacionTableModel {
  id: number;
  codigo: string | null;
  empleadoId: number;
  empleadoNombre: string | null;
  cargoNombre: string | null;
  sueldo: number | null;
  fecha: string | null;
  estadoVinculacion: string | null;
  active: boolean;
}

export interface CreateVinculacionDto {
  empleadoId: number;
  cargoId: number | null;
  grupoNominaId: number | null;
  codigo: string | null;
  fecha: string | null;
  fechaFin: string | null;
  tipoVinculacion: string | null;
  tipoContrato: string | null;
  sueldo: number | null;
  horaTrabajo: number | null;
  periodoPrueba: boolean;
  frecuenciaPago: string | null;
  tipoCotizante: string | null;
  estadoVinculacion: string | null;
  objeto: string | null;
  temporal: boolean;
}

export interface UpdateVinculacionDto extends CreateVinculacionDto {
  id: number;
  active?: boolean;
}
