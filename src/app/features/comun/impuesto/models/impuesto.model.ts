export interface ImpuestoModel {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string | null;
  causacion: string | null;
  baseGravable: string | null;
  periodicidad: string | null;
  aplicaAiu: boolean | null;
  retencionNomina: boolean | null;
  tarifa: number | null;
  vigenciaId: number | null;
  cuentaCompraId: number | null;
  cuentaVentaId: number | null;
  active: boolean;
  createdAt: string;
}

export interface ImpuestoTableModel {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string | null;
  tarifa: number | null;
  active: boolean;
}

export interface CreateImpuestoDto {
  codigo: string;
  nombre: string;
  tipo: string | null;
  causacion: string | null;
  baseGravable: string | null;
  periodicidad: string | null;
  aplicaAiu: boolean;
  retencionNomina: boolean;
  tarifa: number | null;
  vigenciaId: number | null;
}

export interface UpdateImpuestoDto extends CreateImpuestoDto {
  id: number;
  active?: boolean;
}
