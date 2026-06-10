export interface SaldoInventarioModel {
  id: number;
  bodegaId: number | null;
  ubicacionId: number | null;
  loteId: number | null;
  productoId: number | null;
  productoVarianteId: number | null;
  cantidad: number | null;
  costoPromedio: number | null;
  valorTotal: number | null;
}
