export interface GrupoNominaModel {
  id: number;
  codigo: string;
  nombre: string;
  frecuenciaPago: string | null;
  active: boolean;
  createdAt: string;
}

export interface GrupoNominaTableModel {
  id: number;
  codigo: string;
  nombre: string;
  frecuenciaPago: string | null;
  active: boolean;
}

export interface CreateGrupoNominaDto {
  codigo: string;
  nombre: string;
  frecuenciaPago: string | null;
}

export interface UpdateGrupoNominaDto extends CreateGrupoNominaDto {
  id: number;
  active?: boolean;
}
