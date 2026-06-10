export interface RolModel {
  id: number;
  name: string;
  active: boolean;
  createdAt: string;
  permisoIds: number[];
}

export interface RolTableModel {
  id: number;
  name: string;
  active: boolean;
}

export interface CreateRolDto {
  name: string;
  permisoIds: number[];
}

export interface UpdateRolDto extends CreateRolDto {
  id: number;
  active?: boolean;
}
