export interface RubroPresupuestalModel {
  id: number;
  vigenciaId: number | null;
  rubroPadreId: number | null;
  tipoRubro: string | null;
  codigoRubro: string;
  nombreRubro: string;
  manejaMovimiento: boolean;
  homologacionCircularUnica: string | null;
  nivel: number | null;
  active: boolean;
  createdAt: string;
}

export interface RubroPresupuestalTableModel {
  id: number;
  vigenciaId: number | null;
  rubroPadreId: number | null;
  tipoRubro: string | null;
  codigoRubro: string;
  nombreRubro: string;
  manejaMovimiento: boolean;
  active: boolean;
}

export interface CreateRubroPresupuestalDto {
  vigenciaId: number | null;
  rubroPadreId: number | null;
  tipoRubro: string | null;
  codigoRubro: string;
  nombreRubro: string;
  manejaMovimiento: boolean;
  homologacionCircularUnica: string | null;
}

export interface UpdateRubroPresupuestalDto extends CreateRubroPresupuestalDto {
  id: number;
}
