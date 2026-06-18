export interface SaldoPresupuestalModel {
  id: number;
  rubroPresupuestalId: number;
  anio: number;
  mes: number;
  planInicial: number | null;
  adiciones: number | null;
  reducciones: number | null;
  aplazamientos: number | null;
  creditos: number | null;
  contraCreditos: number | null;
  disponibilidad: number | null;
  compromiso: number | null;
  obligacion: number | null;
  pagado: number | null;
  reconocimientos: number | null;
  recaudos: number | null;
  apropiacionNeta: number | null;
}

export interface AfectacionPresupuestalTableModel {
  id: number;
  rubroPresupuestalId: number;
  tipoOperacion: string;
  valor: number | null;
  createdAt: string;
}

export interface CreateAfectacionDto {
  rubroPresupuestalId: number | null;
  tipoOperacion: string;
  terceroId: number | null;
  centroCostoId: number | null;
  proyectoId: number | null;
  fuenteFinanciamientoId: number | null;
  cpcId: number | null;
  descripcion: string | null;
  valor: number | null;
}

export interface ApropiarDto {
  rubroPresupuestalId: number | null;
  anio: number | null;
  planInicial: number | null;
  adiciones: number | null;
  reducciones: number | null;
  aplazamientos: number | null;
  creditos: number | null;
  contraCreditos: number | null;
}
