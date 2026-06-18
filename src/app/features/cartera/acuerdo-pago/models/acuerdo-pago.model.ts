export interface AcuerdoPagoCuotaModel {
  id: number;
  acuerdoPagoId: number;
  numeroCuota: number;
  valor: number | null;
  fechaAplicacion: string | null;
  estado: string;
}

export interface AcuerdoPagoModel {
  id: number;
  cuentaPorCobrarId: number | null;
  fecha: string | null;
  numeroCuotas: number | null;
  estado: string;
  active: boolean;
  createdAt: string;
  cuotas: AcuerdoPagoCuotaModel[];
}

export interface AcuerdoPagoTableModel {
  id: number;
  cuentaPorCobrarId: number | null;
  fecha: string | null;
  numeroCuotas: number | null;
  estado: string;
  active: boolean;
}

export interface CreateAcuerdoPagoCuotaDto {
  valor: number | null;
  fechaAplicacion: string | null;
}

export interface CreateAcuerdoPagoDto {
  cuentaPorCobrarId: number | null;
  fecha: string | null;
  cuotas: CreateAcuerdoPagoCuotaDto[];
}
