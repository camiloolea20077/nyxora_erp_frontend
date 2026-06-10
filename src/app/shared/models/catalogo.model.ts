/** Ítem genérico de catálogo (municipio, tipo_contribuyente, actividad_economica, etc.). */
export interface CatalogoItem {
  id: number;
  codigo: string;
  nombre: string;
  active: boolean;
}

/** Ubicación de un municipio (para el cascade país → depto → municipio). */
export interface UbicacionMunicipio {
  municipioId: number;
  departamentoId: number;
  paisId: number;
}

/** Alta/edición de un ítem de catálogo plano. */
export interface CatalogoCrud {
  id?: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}
