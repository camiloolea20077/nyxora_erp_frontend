export interface EvaluacionProgramaModel {
  id: number;
  codigo: string | null;
  nombre: string;
  fechaInicial: string | null;
  fechaFinal: string | null;
  active: boolean;
  createdAt: string;
}

export interface EvaluacionProgramaTableModel {
  id: number;
  codigo: string | null;
  nombre: string;
  fechaInicial: string | null;
  fechaFinal: string | null;
  active: boolean;
}

export interface CreateEvaluacionProgramaDto {
  codigo: string | null;
  nombre: string;
  fechaInicial: string | null;
  fechaFinal: string | null;
}

export interface UpdateEvaluacionProgramaDto extends CreateEvaluacionProgramaDto {
  id: number;
  active?: boolean;
}
