export interface ProductoModel {
  id: number;
  categoriaId: number | null;
  codigo: string;
  codigoUnspsc: string | null;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  esCompuesto: boolean | null;
  unidadMayorId: number | null;
  unidadMenorId: number | null;
  contenido: number | null;
  manejaInventario: boolean | null;
  manejaLote: boolean | null;
  manejaDesperdicio: boolean | null;
  esDevolutivo: boolean | null;
  stockMinimo: number | null;
  stockMaximo: number | null;
  tiempoReabastecimiento: number | null;
  impuestoId: number | null;
  discriminaIva: boolean | null;
  aplicaImpuestoBolsa: boolean | null;
  tarifaMaxima: number | null;
  esPos: boolean | null;
  recursoId: number | null;
  active: boolean;
  createdAt: string;
  impuestoIds: number[];
}

export interface ProductoTableModel {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  categoriaId: number | null;
  active: boolean;
}

export interface CreateProductoDto {
  categoriaId: number | null;
  codigo: string;
  codigoUnspsc: string | null;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  esCompuesto: boolean;
  unidadMayorId: number | null;
  unidadMenorId: number | null;
  contenido: number | null;
  manejaInventario: boolean;
  manejaLote: boolean;
  manejaDesperdicio: boolean;
  esDevolutivo: boolean;
  stockMinimo: number | null;
  stockMaximo: number | null;
  tiempoReabastecimiento: number | null;
  impuestoId: number | null;
  discriminaIva: boolean;
  aplicaImpuestoBolsa: boolean;
  tarifaMaxima: number | null;
  esPos: boolean;
  recursoId: number | null;
  impuestoIds: number[];
}

export interface UpdateProductoDto extends CreateProductoDto {
  id: number;
  active?: boolean;
}
