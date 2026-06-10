export interface TipoDocumentoModel {
  id: number;
  modulo: string;
  codigo: string;
  nombre: string;
  prefijo: string | null;
  reiniciaPorVigencia: boolean | null;
  active: boolean;
  createdAt: string;
}

export interface TipoDocumentoTableModel {
  id: number;
  modulo: string;
  codigo: string;
  nombre: string;
  prefijo: string | null;
  active: boolean;
}

export interface CreateTipoDocumentoDto {
  modulo: string;
  codigo: string;
  nombre: string;
  prefijo: string | null;
  reiniciaPorVigencia: boolean;
}

export interface UpdateTipoDocumentoDto extends CreateTipoDocumentoDto {
  id: number;
  active?: boolean;
}
