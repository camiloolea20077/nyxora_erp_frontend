export type VigenciaStatus = 'planeada' | 'abierta' | 'en_cierre' | 'cerrada';

export interface VigenciaModel {
  id: number;
  year: number;
  status: VigenciaStatus;
  openDate: string | null;
  closeDate: string | null;
  active: boolean;
  createdAt: string;
}

export interface VigenciaTableModel {
  id: number;
  year: number;
  status: VigenciaStatus;
  active: boolean;
}

export interface CreateVigenciaDto {
  year: number;
}

export interface UpdateVigenciaDto extends CreateVigenciaDto {
  id: number;
}
