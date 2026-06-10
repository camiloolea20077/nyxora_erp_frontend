export interface CuentaModel {
  id: number;
  cuentaPadreId: number | null;
  codigoCuenta: string;
  nombreCuenta: string;
  nivel: number | null;
  izquierda: number | null;
  derecha: number | null;
  naturaleza: string | null;
  tipoCuenta: string | null;
  manejaMovimiento: boolean | null;
  manejaMovimientoManual: boolean | null;
  manejaTercero: boolean | null;
  manejaCentroCosto: boolean | null;
  manejaImpuesto: boolean | null;
  manejaProyecto: boolean | null;
  manejaRecurso: boolean | null;
  manejaSaldoContrario: boolean | null;
  esCorriente: boolean | null;
  active: boolean;
  createdAt: string;
}

export interface CuentaTableModel {
  id: number;
  cuentaPadreId: number | null;
  codigoCuenta: string;
  nombreCuenta: string;
  naturaleza: string | null;
  manejaMovimiento: boolean | null;
  active: boolean;
}

export interface CreateCuentaDto {
  cuentaPadreId: number | null;
  codigoCuenta: string;
  nombreCuenta: string;
  naturaleza: string | null;
  tipoCuenta: string | null;
  manejaMovimiento: boolean;
  manejaMovimientoManual: boolean;
  manejaTercero: boolean;
  manejaCentroCosto: boolean;
  manejaImpuesto: boolean;
  manejaProyecto: boolean;
  manejaRecurso: boolean;
  manejaSaldoContrario: boolean;
  esCorriente: boolean;
}

export interface UpdateCuentaDto extends CreateCuentaDto {
  id: number;
  active?: boolean;
}
