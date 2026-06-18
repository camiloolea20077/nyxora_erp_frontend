export interface PolizaSeguroModel {
  id: number;
  numero: string;
  aseguradoraId: number | null;
  aseguradoraNombre: string | null;
  tipo: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  valorAsegurado: number | null;
  active: boolean;
  createdAt: string;
}

export interface PolizaSeguroTableModel {
  id: number;
  numero: string;
  tipo: string | null;
  valorAsegurado: number | null;
  fechaFin: string | null;
  active: boolean;
}

export interface CreatePolizaSeguroDto {
  numero: string;
  aseguradoraId: number | null;
  tipo: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  valorAsegurado: number | null;
}

export interface UpdatePolizaSeguroDto extends CreatePolizaSeguroDto {
  id: number;
}
