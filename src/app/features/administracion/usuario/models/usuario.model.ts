export interface UsuarioModel {
  id: number;
  terceroId: number;
  terceroNombre: string;
  username: string;
  email: string;
  active: boolean;
  createdAt: string;
}

export interface UsuarioTableModel {
  id: number;
  username: string;
  email: string;
  terceroNombre: string;
  active: boolean;
}

export interface CreateUsuarioDto {
  terceroId: number;
  username: string;
  email: string;
  password: string;
}

export interface UpdateUsuarioDto {
  id: number;
  email: string;
  active?: boolean;
  password?: string;
}

export interface AsignarRolDto {
  rolId: number;
  sedeId: number;
}
