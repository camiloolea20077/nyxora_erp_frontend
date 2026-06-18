export interface AsignaturaModel {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  centroCostoDepartamentoId: number | null;
  active: boolean;
  createdAt: string;
}

export interface AsignaturaTableModel {
  id: number;
  codigo: string;
  nombre: string;
  active: boolean;
}

export interface CreateAsignaturaDto {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  centroCostoDepartamentoId: number | null;
}

export interface UpdateAsignaturaDto extends CreateAsignaturaDto {
  id: number;
  active?: boolean;
}

// ── Enlace asignatura ↔ programa ──
export interface ProgramaAsignaturaModel {
  id: number;
  asignaturaId: number;
  programaAcademicoId: number;
  programaNombre: string | null;
  semestre: number | null;
  creditos: number | null;
  active: boolean;
}

export interface AddProgramaAsignaturaDto {
  programaAcademicoId: number;
  semestre: number | null;
  creditos: number | null;
}
