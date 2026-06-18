export interface CargaDetalle {
  id: number;
  asignaturaProgramaId: number | null;
  grupoAcademicoId: number | null;
  asignaturaNombre: string | null;
  grupoNombre: string | null;
  horas: number | null;
}

export interface CargaDetalleLinea {
  asignaturaProgramaId: number | null;
  grupoAcademicoId: number | null;
  horas: number | null;
}

export interface CargaAcademicaModel {
  id: number;
  vinculacionId: number;
  docenteNombre: string | null;
  nivelEstudioId: number | null;
  numeroActoAdministrativo: string | null;
  fechaActoAdministrativo: string | null;
  active: boolean;
  createdAt: string;
  detalle: CargaDetalle[];
}

export interface CargaAcademicaTableModel {
  id: number;
  vinculacionId: number;
  docenteNombre: string | null;
  numeroActoAdministrativo: string | null;
  fechaActoAdministrativo: string | null;
  active: boolean;
}

export interface CreateCargaAcademicaDto {
  vinculacionId: number;
  nivelEstudioId: number | null;
  numeroActoAdministrativo: string | null;
  fechaActoAdministrativo: string | null;
  detalle: CargaDetalleLinea[];
}

export interface UpdateCargaAcademicaDto extends CreateCargaAcademicaDto {
  id: number;
  active?: boolean;
}

export interface GenerarNovedadDocenteDto {
  conceptoNominaId: number;
  valorHora: number;
}
