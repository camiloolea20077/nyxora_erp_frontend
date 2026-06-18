export interface CuentaPorCobrarModel {
  id: number;
  clienteId: number | null;
  facturaId: number | null;
  cuentaId: number | null;
  fechaEmision: string | null;
  fechaVencimiento: string | null;
  dias: number | null;
  valorTotal: number | null;
  valorInteres: number | null;
  saldo: number | null;
  fechaUltimaLiquidacion: string | null;
  estado: string;
  active: boolean;
  createdAt: string;
}

export interface CuentaPorCobrarTableModel {
  id: number;
  clienteId: number | null;
  facturaId: number | null;
  fechaEmision: string | null;
  fechaVencimiento: string | null;
  valorTotal: number | null;
  saldo: number | null;
  estado: string;
  active: boolean;
}

export interface CreateCuentaPorCobrarDto {
  clienteId: number | null;
  cuentaId: number | null;
  fechaEmision: string | null;
  fechaVencimiento: string | null;
  dias: number | null;
  valorTotal: number | null;
}
