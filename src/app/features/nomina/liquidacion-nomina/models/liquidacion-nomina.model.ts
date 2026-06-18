export interface LiquidacionNominaModel {
  id: number;
  grupoNominaId: number | null;
  anio: number;
  mes: number;
  periodo: string | null;
  fecha: string | null;
  estado: string;
  active: boolean;
  createdAt: string;
}

export interface LiquidacionNominaTableModel {
  id: number;
  anio: number;
  mes: number;
  periodo: string | null;
  fecha: string | null;
  estado: string;
  active: boolean;
}

export interface CreateLiquidacionNominaDto {
  grupoNominaId: number | null;
  anio: number;
  mes: number;
  periodo: string | null;
  fecha: string;
}

export interface UpdateLiquidacionNominaDto extends CreateLiquidacionNominaDto {
  id: number;
}

export interface LiquidarNominaDto {
  conceptoSueldoId: number | null;
}

export interface ContabilizarNominaDto {
  periodoContableId: number;
  cuentaGastoId: number;
  cuentaPorPagarId: number;
  cuentaDeduccionesId: number | null;
}

export interface LiquidacionDetalle {
  id: number;
  empleadoId: number;
  empleadoNombre: string | null;
  conceptoNominaId: number;
  conceptoNombre: string | null;
  clase: string | null;
  base: number | null;
  cantidad: number | null;
  valor: number | null;
  valorEmpleado: number | null;
  valorPatrono: number | null;
  tipoAporte: string | null;
}

export interface AportePila {
  id: number;
  empleadoId: number;
  empleadoNombre: string | null;
  tipoAporte: string;
  ibc: number | null;
  valorEmpleado: number | null;
  valorPatrono: number | null;
}
