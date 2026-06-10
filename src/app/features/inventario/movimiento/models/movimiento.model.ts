export interface CreateMovimientoDto {
  bodegaId: number | null;
  ubicacionId: number | null;
  productoId: number | null;
  loteId: number | null;
  tipo: string;
  fecha: string | null;
  cantidad: number | null;
  costoUnitario: number | null;
  centroCostoId: number | null;
  terceroId: number | null;
  descripcion: string | null;
}

export interface KardexItem {
  id: number;
  bodegaId: number | null;
  productoId: number | null;
  productoVarianteId: number | null;
  loteId: number | null;
  tipo: string;
  fecha: string | null;
  cantidad: number | null;
  costoUnitario: number | null;
  descripcion: string | null;
  saldoCorriente: number | null;
}
