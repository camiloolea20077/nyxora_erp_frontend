export interface ReciboCajaPagoModel {
  id: number;
  reciboCajaId: number;
  formaPagoId: number | null;
  valor: number | null;
  bancoId: number | null;
  numeroCheque: string | null;
  numeroTarjeta: string | null;
  cuentaBancaria: string | null;
}

export interface ReciboCajaLineaModel {
  id: number;
  reciboCajaId: number;
  cuentaPorCobrarId: number | null;
  valorAplicado: number | null;
}

export interface ReciboCajaModel {
  id: number;
  cajaId: number | null;
  tipoDocumentoId: number | null;
  numero: string | null;
  clienteId: number | null;
  fecha: string | null;
  valor: number | null;
  estado: string;
  observaciones: string | null;
  active: boolean;
  createdAt: string;
  pagos: ReciboCajaPagoModel[];
  lineas: ReciboCajaLineaModel[];
}

export interface ReciboCajaTableModel {
  id: number;
  cajaId: number | null;
  numero: string | null;
  clienteId: number | null;
  fecha: string | null;
  valor: number | null;
  estado: string;
  active: boolean;
}

export interface CreateReciboCajaPagoDto {
  formaPagoId: number | null;
  valor: number | null;
  bancoId: number | null;
  numeroCheque: string | null;
  numeroTarjeta: string | null;
  cuentaBancaria: string | null;
}

export interface CreateReciboCajaLineaDto {
  cuentaPorCobrarId: number | null;
  valorAplicado: number | null;
}

export interface CreateReciboCajaDto {
  cajaId: number | null;
  tipoDocumentoId: number | null;
  numero: string | null;
  clienteId: number | null;
  fecha: string | null;
  observaciones: string | null;
  pagos: CreateReciboCajaPagoDto[];
  lineas: CreateReciboCajaLineaDto[];
  cuentaCajaId: number | null;
  cuentaCxcId: number | null;
  periodoContableId: number | null;
}
