export interface ProcesoDisciplinarioModel {
  id: number;
  fecha: string | null;
  vinculacionId: number | null;
  investigadoNombre: string | null;
  responsableId: number | null;
  descripcion: string | null;
  estado: string;
  active: boolean;
  createdAt: string;
}

export interface ProcesoDisciplinarioTableModel {
  id: number;
  fecha: string | null;
  investigadoNombre: string | null;
  estado: string;
  active: boolean;
}

export interface CreateProcesoDisciplinarioDto {
  fecha: string;
  vinculacionId: number | null;
  responsableId: number | null;
  descripcion: string | null;
}

export interface UpdateProcesoDisciplinarioDto extends CreateProcesoDisciplinarioDto {
  id: number;
  active?: boolean;
}

export interface CambiarEstadoProcesoDto {
  estado: string;
}

export interface ProcesoFalta {
  id: number;
  faltaId: number;
  faltaCodigo: string | null;
  faltaNombre: string | null;
}
export interface AddProcesoFaltaDto {
  faltaId: number;
}

export interface ProcesoDescargo {
  id: number;
  fecha: string | null;
  texto: string | null;
}
export interface CreateProcesoDescargoDto {
  fecha: string | null;
  texto: string | null;
}

export interface ProcesoNotificacion {
  id: number;
  fecha: string | null;
  tipo: string | null;
  texto: string | null;
}
export interface CreateProcesoNotificacionDto {
  fecha: string | null;
  tipo: string | null;
  texto: string | null;
}
