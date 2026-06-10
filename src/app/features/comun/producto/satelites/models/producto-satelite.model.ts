// ── Variantes ──
export interface VarianteModel {
  id: number;
  productoId: number;
  skuPlu: string | null;
  codigoBarra: string | null;
  precioAdicional: number | null;
  costo: number | null;
  active: boolean;
}
export interface VarianteCreate {
  skuPlu: string | null;
  codigoBarra: string | null;
  precioAdicional: number | null;
  costo: number | null;
}
export interface VarianteUpdate extends VarianteCreate {
  id: number;
  active?: boolean;
}

// ── Proveedores ──
export interface ProveedorModel {
  id: number;
  productoId: number;
  proveedorId: number | null;
  codigoProducto: string | null;
  cantidadMinima: number | null;
  plazoEntrega: number | null;
  active: boolean;
}
export interface ProveedorCreate {
  proveedorId: number | null;
  codigoProducto: string | null;
  cantidadMinima: number | null;
  plazoEntrega: number | null;
}
export interface ProveedorUpdate extends ProveedorCreate {
  id: number;
  active?: boolean;
}
