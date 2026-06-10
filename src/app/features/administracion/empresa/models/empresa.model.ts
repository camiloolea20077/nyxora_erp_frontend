export interface EmpresaModel {
  id: number;
  nit: string;
  digitoVerificacion: number | null;
  razonSocial: string;
  nombreComercial: string | null;
  codigo: string | null;
  tipoPersona: string;
  representanteLegal: string | null;
  regimenTributario: string | null;
  tipoContribuyenteId: number | null;
  responsabilidadFiscal: string | null;
  actividadEconomicaId: number | null;
  sector: string | null;
  email: string | null;
  telefono: string | null;
  celular: string | null;
  sitioWeb: string | null;
  municipioId: number | null;
  direccion: string | null;
  codigoPostal: string | null;
  logoUrl: string | null;
  active: boolean;
  createdAt: string;
}

export interface UpdateEmpresaDto {
  id: number;
  nit: string;
  digitoVerificacion: number | null;
  razonSocial: string;
  nombreComercial: string | null;
  codigo: string | null;
  tipoPersona: string;
  representanteLegal: string | null;
  regimenTributario: string | null;
  tipoContribuyenteId: number | null;
  responsabilidadFiscal: string | null;
  actividadEconomicaId: number | null;
  sector: string | null;
  email: string | null;
  telefono: string | null;
  celular: string | null;
  sitioWeb: string | null;
  municipioId: number | null;
  direccion: string | null;
  codigoPostal: string | null;
  logoUrl: string | null;
  active: boolean;
}
