export interface ClausulaPlantillaModel {
  id: number;
  tipoClausula: string | null;
  numero: string | null;
  orden: string | null;
  nombre: string | null;
  texto: string | null;
  active: boolean;
  createdAt: string;
}

export interface ClausulaPlantillaTableModel {
  id: number;
  tipoClausula: string | null;
  numero: string | null;
  nombre: string | null;
  active: boolean;
}

export interface CreateClausulaPlantillaDto {
  nombre: string;
  tipoClausula: string | null;
  numero: string | null;
  orden: string | null;
  texto: string | null;
}

export interface UpdateClausulaPlantillaDto extends CreateClausulaPlantillaDto {
  id: number;
}
