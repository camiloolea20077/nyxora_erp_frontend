export type ClaseConcepto = 'devengado' | 'deduccion' | 'provision' | 'aporte';

export interface ConceptoNominaModel {
  id: number;
  codigo: string;
  nombre: string;
  frecuencia: string | null;
  clase: string;
  formula: string | null;
  cuentaCreditoId: number | null;
  cuentaPatronoId: number | null;
  rubroPresupuestalId: number | null;
  fuenteFinanciamientoId: number | null;
  terceroId: number | null;
  active: boolean;
  createdAt: string;
}

export interface ConceptoNominaTableModel {
  id: number;
  codigo: string;
  nombre: string;
  clase: string;
  frecuencia: string | null;
  active: boolean;
}

export interface CreateConceptoNominaDto {
  codigo: string;
  nombre: string;
  frecuencia: string | null;
  clase: string;
  formula: string | null;
  cuentaCreditoId: number | null;
  cuentaPatronoId: number | null;
  rubroPresupuestalId: number | null;
  fuenteFinanciamientoId: number | null;
  terceroId: number | null;
}

export interface UpdateConceptoNominaDto extends CreateConceptoNominaDto {
  id: number;
  active?: boolean;
}
