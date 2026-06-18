export interface ArqueoModel {
  id: number;
  cajaId: number | null;
  fecha: string | null;
  valorDeclarado: number | null;
  valorSistema: number | null;
  diferencia: number | null;
  observaciones: string | null;
  createdAt: string;
}

export interface ArqueoTableModel {
  id: number;
  cajaId: number | null;
  fecha: string | null;
  valorDeclarado: number | null;
  valorSistema: number | null;
  diferencia: number | null;
}

export interface CreateArqueoDto {
  cajaId: number | null;
  valorDeclarado: number | null;
  observaciones: string | null;
}
