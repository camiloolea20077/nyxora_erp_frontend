export interface ContratoClausulaModel {
  id: number | null;
  numero: string | null;
  orden: string | null;
  nombre: string | null;
  texto: string | null;
}

export interface ContratoPolizaModel {
  id: number;
  polizaSeguroId: number;
  numero: string | null;
  tipo: string | null;
  valorAsegurado: number | null;
}

export interface ContratoModel {
  id: number;
  numero: string | null;
  nombre: string;
  tipoContrato: string | null;
  contratistaId: number | null;
  contratistaNombre: string | null;
  modalidadId: number | null;
  modalidadNombre: string | null;
  objeto: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  valor: number | null;
  estado: string;
  active: boolean;
  createdAt: string;
  clausulas: ContratoClausulaModel[];
  polizas: ContratoPolizaModel[];
}

export interface ContratoTableModel {
  id: number;
  numero: string | null;
  nombre: string;
  contratistaNombre: string | null;
  valor: number | null;
  estado: string;
  fechaInicio: string | null;
  active: boolean;
}

export interface ContratoClausulaDto {
  numero: string | null;
  orden: string | null;
  nombre: string | null;
  texto: string | null;
}

export interface CreateContratoDto {
  nombre: string;
  numero: string | null;
  tipoContrato: string | null;
  contratistaId: number | null;
  modalidadId: number | null;
  objeto: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  valor: number | null;
  clausulas: ContratoClausulaDto[];
}

export interface UpdateContratoDto extends CreateContratoDto {
  id: number;
}

export interface CambiarEstadoContratoDto {
  estado: string;
}

export interface AsignarPolizaContratoDto {
  polizaSeguroId: number;
}

/** Línea de cláusula en el formulario (con _id local para el track). */
export interface ClausulaLineaUI {
  _id: number;
  numero: string | null;
  orden: string | null;
  nombre: string | null;
  texto: string | null;
}
