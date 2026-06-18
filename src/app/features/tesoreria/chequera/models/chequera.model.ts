export interface ChequeraModel {
  id: number;
  cuentaBancariaId: number | null;
  fechaExpedicion: string | null;
  numeroInicial: number | null;
  numeroFinal: number | null;
  consecutivoActual: number | null;
  active: boolean;
  createdAt: string;
}

export interface ChequeraTableModel {
  id: number;
  cuentaBancariaId: number | null;
  fechaExpedicion: string | null;
  numeroInicial: number | null;
  numeroFinal: number | null;
  consecutivoActual: number | null;
  active: boolean;
}

export interface CreateChequeraDto {
  cuentaBancariaId: number | null;
  fechaExpedicion: string | null;
  numeroInicial: number | null;
  numeroFinal: number | null;
}

export interface UpdateChequeraDto extends CreateChequeraDto {
  id: number;
}
