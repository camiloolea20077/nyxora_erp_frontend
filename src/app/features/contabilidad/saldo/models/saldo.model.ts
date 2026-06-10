export interface SaldoModel {
  id: number;
  periodoContableId: number;
  cuentaId: number;
  terceroId: number | null;
  centroCostoId: number | null;
  saldoDebitoAnterior: number | null;
  saldoCreditoAnterior: number | null;
  debitoPeriodo: number | null;
  creditoPeriodo: number | null;
  saldoDebitoFinal: number | null;
  saldoCreditoFinal: number | null;
}
