// ── Contactos ──
export interface ContactoModel {
  id: number;
  terceroId: number;
  nombre: string | null;
  cargo: string | null;
  telefono: string | null;
  celular: string | null;
  email: string | null;
  notas: string | null;
  principal: boolean | null;
  active: boolean;
}
export interface ContactoCreate {
  nombre: string | null;
  cargo: string | null;
  telefono: string | null;
  celular: string | null;
  email: string | null;
  notas: string | null;
  principal: boolean;
}
export interface ContactoUpdate extends ContactoCreate {
  id: number;
  active?: boolean;
}

// ── Direcciones ──
export interface DireccionModel {
  id: number;
  terceroId: number;
  tipo: string | null;
  direccion: string | null;
  municipioId: number | null;
  barrioId: number | null;
  codigoPostal: string | null;
  telefono: string | null;
  principal: boolean | null;
  active: boolean;
}
export interface DireccionCreate {
  tipo: string;
  direccion: string | null;
  municipioId: number | null;
  barrioId: number | null;
  codigoPostal: string | null;
  telefono: string | null;
  principal: boolean;
}
export interface DireccionUpdate extends DireccionCreate {
  id: number;
  active?: boolean;
}

// ── Cuentas bancarias ──
export interface CuentaModel {
  id: number;
  terceroId: number;
  bancoId: number | null;
  tipoCuentaBancariaId: number | null;
  numeroCuenta: string | null;
  principal: boolean | null;
  active: boolean;
}
export interface CuentaCreate {
  bancoId: number | null;
  tipoCuentaBancariaId: number | null;
  numeroCuenta: string | null;
  principal: boolean;
}
export interface CuentaUpdate extends CuentaCreate {
  id: number;
  active?: boolean;
}
