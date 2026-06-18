export interface CuentaBancariaModel {
  id: number;
  bancoId: number | null;
  bancoNombre: string | null;
  tipoCuentaBancariaId: number | null;
  numeroCuenta: string;
  cuentaContableId: number | null;
  manejaSobregiro: boolean;
  aceptaTransferencias: boolean;
  fechaExpiracion: string | null;
  active: boolean;
  createdAt: string;
}

export interface CuentaBancariaTableModel {
  id: number;
  bancoId: number | null;
  bancoNombre: string | null;
  tipoCuentaBancariaId: number | null;
  numeroCuenta: string;
  manejaSobregiro: boolean;
  aceptaTransferencias: boolean;
  active: boolean;
}

export interface CreateCuentaBancariaDto {
  bancoId: number | null;
  tipoCuentaBancariaId: number | null;
  numeroCuenta: string;
  cuentaContableId: number | null;
  manejaSobregiro: boolean;
  aceptaTransferencias: boolean;
  fechaExpiracion: string | null;
}

export interface UpdateCuentaBancariaDto extends CreateCuentaBancariaDto {
  id: number;
}
