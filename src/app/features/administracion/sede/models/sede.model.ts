export interface SedeModel {
  id: number;
  code: string;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface SedeTableModel {
  id: number;
  code: string;
  name: string;
  active: boolean;
}

export interface CreateSedeDto {
  code: string;
  name: string;
}

export interface UpdateSedeDto extends CreateSedeDto {
  id: number;
  active?: boolean;
}
