export interface ProgramaModel {
  id: number;
  codigo: string | null;
  nombre: string;
  tipoPrograma: string | null;
  modalidad: string | null;
  centroCostoProgramaId: number | null;
  centroCostoFacultadId: number | null;
  registroAcademico: string | null;
  descripcion: string | null;
  active: boolean;
  createdAt: string;
}

export interface ProgramaTableModel {
  id: number;
  codigo: string | null;
  nombre: string;
  tipoPrograma: string | null;
  modalidad: string | null;
  active: boolean;
}

export interface CreateProgramaDto {
  codigo: string | null;
  nombre: string;
  tipoPrograma: string | null;
  modalidad: string | null;
  centroCostoProgramaId: number | null;
  centroCostoFacultadId: number | null;
  registroAcademico: string | null;
  descripcion: string | null;
}

export interface UpdateProgramaDto extends CreateProgramaDto {
  id: number;
  active?: boolean;
}
