export interface BalanceLinea {
  clase: string;
  codigoCuenta: string;
  nombreCuenta: string;
  debito: number;
  credito: number;
  saldo: number;
}

export interface BalanceGeneral {
  periodoContableId: number;
  activos: BalanceLinea[];
  pasivos: BalanceLinea[];
  patrimonio: BalanceLinea[];
  totalActivo: number;
  totalPasivo: number;
  totalPatrimonio: number;
  totalPasivoPatrimonio: number;
  descuadre: number;
}

export interface EstadoResultados {
  periodoContableId: number;
  ingresos: BalanceLinea[];
  costosGastos: BalanceLinea[];
  totalIngresos: number;
  totalCostosGastos: number;
  utilidad: number;
}

export interface CarteraTercero {
  clienteId: number;
  clienteNombre: string | null;
  documentos: number;
  saldoTotal: number;
  saldoVencido: number;
}

export interface EjecucionRubro {
  rubroId: number;
  codigoRubro: string;
  nombreRubro: string;
  tipoRubro: string | null;
  apropiacion: number;
  comprometido: number;
  obligado: number;
  pagado: number;
  disponible: number;
}

export interface CierrePeriodoResult {
  periodoContableId: number;
  anio: number;
  mes: number;
  estado: string;
  saldosRecalculados: number;
  mensaje: string;
}
