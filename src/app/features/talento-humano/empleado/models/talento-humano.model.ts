// ── Estudios ──
export interface EstudioModel {
  id: number;
  empleadoId: number;
  nivelEstudioId: number | null;
  institucion: string | null;
  titulo: string | null;
  fechaInicial: string | null;
  fechaFinal: string | null;
  fechaGrado: string | null;
  numeroTarjetaProfesional: string | null;
  municipioEstudioId: number | null;
  semestresAprobados: number | null;
  convalidado: boolean | null;
  active: boolean;
}
export interface EstudioCreate {
  nivelEstudioId: number | null;
  institucion: string | null;
  titulo: string | null;
  fechaInicial: string | null;
  fechaFinal: string | null;
  fechaGrado: string | null;
  numeroTarjetaProfesional: string | null;
  municipioEstudioId: number | null;
  semestresAprobados: number | null;
  convalidado: boolean;
}
export interface EstudioUpdate extends EstudioCreate {
  id: number;
  active?: boolean;
}

// ── Familiares ──
export interface FamiliarModel {
  id: number;
  empleadoId: number;
  nombreApellido: string;
  fechaNacimiento: string | null;
  parentesco: string | null;
  aCargo: boolean | null;
  vivo: boolean | null;
  convive: boolean | null;
  dependienteRetencion: boolean | null;
}
export interface FamiliarCreate {
  nombreApellido: string;
  fechaNacimiento: string | null;
  parentesco: string | null;
  aCargo: boolean;
  vivo: boolean;
  convive: boolean;
  dependienteRetencion: boolean;
}
export interface FamiliarUpdate extends FamiliarCreate {
  id: number;
}

// ── Historia laboral ──
export interface HistoriaLaboralModel {
  id: number;
  empleadoId: number;
  nombreEmpresa: string | null;
  cargo: string | null;
  tipoContrato: string | null;
  fechaInicio: string | null;
  fechaFinal: string | null;
  jefeInmediato: string | null;
  municipioId: number | null;
  esPublico: boolean | null;
}
export interface HistoriaLaboralCreate {
  nombreEmpresa: string | null;
  cargo: string | null;
  tipoContrato: string | null;
  fechaInicio: string | null;
  fechaFinal: string | null;
  jefeInmediato: string | null;
  municipioId: number | null;
  esPublico: boolean;
}
export interface HistoriaLaboralUpdate extends HistoriaLaboralCreate {
  id: number;
}

// ── Evaluación de desempeño ──
export interface EvaluacionDesempenoModel {
  id: number;
  evaluacionProgramaId: number | null;
  empleadoId: number | null;
  tipoEvaluacion: string | null;
  fechaInicial: string | null;
  fechaFinal: string | null;
  calificacion: number | null;
  createdAt: string;
}
export interface EvaluacionDesempenoTableModel {
  id: number;
  evaluacionProgramaId: number | null;
  empleadoId: number | null;
  tipoEvaluacion: string | null;
  fechaInicial: string | null;
  calificacion: number | null;
}
export interface EvaluacionDesempenoCreate {
  evaluacionProgramaId: number | null;
  empleadoId: number;
  tipoEvaluacion: string | null;
  fechaInicial: string | null;
  fechaFinal: string | null;
  calificacion: number | null;
}
export interface EvaluacionDesempenoUpdate extends EvaluacionDesempenoCreate {
  id: number;
}
