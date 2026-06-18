export interface PacPresupuestalModel {
  id: number;
  rubroPresupuestalId: number;
  anio: number;
  mes: number;
  valor: number | null;
}

export interface PacUpsertDto {
  rubroPresupuestalId: number | null;
  anio: number | null;
  mes: number | null;
  valor: number | null;
}
