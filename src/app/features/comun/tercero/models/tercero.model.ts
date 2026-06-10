import { Pageable } from '../../../../shared/models/api.model';

export interface TerceroTableModel {
  id: number;
  tipoDocumento: string | null;
  numeroDocumento: string;
  nombre: string;
  tipoPersona: string;
  active: boolean;
}

/** Detalle completo del tercero (← TerceroResponseDto). */
export interface TerceroModel {
  id: number;
  tipoIdentificacionId: number | null;
  numeroDocumento: string;
  digitoVerificacion: number | null;
  tipoPersona: string;
  primerNombre: string | null;
  segundoNombre: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
  razonSocial: string | null;
  nombreComercial: string | null;
  nombreRepresentanteLegal: string | null;
  documentoRepresentanteLegal: string | null;
  nombre: string | null;
  generoId: number | null;
  estadoCivilId: number | null;
  fechaNacimiento: string | null;
  municipioId: number | null;
  barrioId: number | null;
  direccion: string | null;
  sitioWeb: string | null;
  fechaExpedicionDocumento: string | null;
  municipioExpedicionId: number | null;
  fechaVencimientoDocumento: string | null;
  actividadEconomicaId: number | null;
  tipoContribuyenteId: number | null;
  responsableIva: boolean | null;
  esAutoretenedorIva: boolean | null;
  esAutoretenedorIca: boolean | null;
  esAutoretenedorFuente: boolean | null;
  declarante: boolean | null;
  aplicaArt383: boolean | null;
  tieneRut: boolean | null;
  condicionPagoClienteId: number | null;
  condicionPagoProveedorId: number | null;
  formaPagoClienteId: number | null;
  formaPagoProveedorId: number | null;
  interesEfectivoMensual: number | null;
  cuentaContableProveedorId: number | null;
  recursoId: number | null;
  esReciproco: boolean | null;
  codigoReciproco: string | null;
  observaciones: string | null;
  active: boolean;
  createdAt: string;
  tipoTerceroIds: number[];
}

/** Campos gestionados por el formulario (los demás los pone el backend o se difieren). */
export interface CreateTerceroDto {
  tipoIdentificacionId: number | null;
  numeroDocumento: string;
  digitoVerificacion: number | null;
  tipoPersona: string;
  primerNombre: string | null;
  segundoNombre: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
  razonSocial: string | null;
  nombreComercial: string | null;
  nombreRepresentanteLegal: string | null;
  documentoRepresentanteLegal: string | null;
  fechaNacimiento: string | null;
  municipioId: number | null;
  direccion: string | null;
  sitioWeb: string | null;
  actividadEconomicaId: number | null;
  tipoContribuyenteId: number | null;
  responsableIva: boolean;
  esAutoretenedorIva: boolean;
  esAutoretenedorIca: boolean;
  esAutoretenedorFuente: boolean;
  declarante: boolean;
  aplicaArt383: boolean;
  tieneRut: boolean;
  condicionPagoClienteId: number | null;
  condicionPagoProveedorId: number | null;
  formaPagoClienteId: number | null;
  formaPagoProveedorId: number | null;
  interesEfectivoMensual: number | null;
  observaciones: string | null;
  tipoTerceroIds: number[];
}

export interface UpdateTerceroDto extends CreateTerceroDto {
  id: number;
  active?: boolean;
}

/** Filtros avanzados (params del listado). */
export interface TerceroFilter {
  tipoTerceroId?: number | null;
  numeroDocumento?: string | null;
  tipoPersona?: string | null;
}

export interface TerceroPageable extends Pageable {
  params?: TerceroFilter | null;
}
