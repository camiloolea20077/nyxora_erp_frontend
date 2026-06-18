export interface GrupoAcademicoModel {
  id: number;
  programaAcademicoId: number | null;
  codigo: string | null;
  nombre: string;
  periodo: string | null;
  active: boolean;
  createdAt: string;
}

export interface GrupoAcademicoTableModel {
  id: number;
  codigo: string | null;
  nombre: string;
  periodo: string | null;
  active: boolean;
}

export interface CreateGrupoAcademicoDto {
  programaAcademicoId: number | null;
  codigo: string | null;
  nombre: string;
  periodo: string | null;
}

export interface UpdateGrupoAcademicoDto extends CreateGrupoAcademicoDto {
  id: number;
  active?: boolean;
}
