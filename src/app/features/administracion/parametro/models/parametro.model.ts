export interface ParametroModel {
  id: number;
  key: string;
  value: string;
  dataType: string;
  active: boolean;
  createdAt: string;
}

export interface ParametroTableModel {
  id: number;
  key: string;
  value: string;
  dataType: string;
  active: boolean;
}

export interface CreateParametroDto {
  key: string;
  value: string;
  dataType: string;
}

export interface UpdateParametroDto {
  id: number;
  key: string;
  value: string;
  dataType: string;
  active?: boolean;
}
