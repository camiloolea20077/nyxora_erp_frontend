export interface FacturaProveedorEventoModel {
  id: number;
  facturaProveedorId: number;
  evento: string | null;
  fechaEvento: string | null;
  cudeEvento: string | null;
  conceptoReclamo: string | null;
  descripcionReclamo: string | null;
  estado: string | null;
  errorEvento: string | null;
}

export interface FacturaProveedorModel {
  id: number;
  proveedorId: number | null;
  receptorId: number | null;
  numeroDocumento: string | null;
  cufe: string | null;
  fechaRecepcion: string | null;
  valorFactura: number | null;
  emailRemitente: string | null;
  pdfUrl: string | null;
  estado: string;
  active: boolean;
  createdAt: string;
  eventos: FacturaProveedorEventoModel[];
}

export interface FacturaProveedorTableModel {
  id: number;
  proveedorId: number | null;
  numeroDocumento: string | null;
  fechaRecepcion: string | null;
  valorFactura: number | null;
  estado: string;
  active: boolean;
}

export interface CreateFacturaProveedorDto {
  proveedorId: number | null;
  receptorId: number | null;
  numeroDocumento: string | null;
  cufe: string | null;
  fechaRecepcion: string | null;
  valorFactura: number | null;
  emailRemitente: string | null;
  pdfUrl: string | null;
}

export interface UpdateFacturaProveedorDto extends CreateFacturaProveedorDto {
  id: number;
}

export interface RegistrarEventoDto {
  evento: string | null;
  fechaEvento: string | null;
  cudeEvento: string | null;
  conceptoReclamo: string | null;
  descripcionReclamo: string | null;
  estado: string | null;
}
