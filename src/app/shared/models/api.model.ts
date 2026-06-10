/**
 * Contrato HTTP del backend Nyxora.
 * (El `ResponseTableModel` de shared/utils es estilo Spring Page y NO aplica a este backend:
 *  el backend devuelve PageResponse { content, page, rows, total }.)
 */
export interface ApiResponse<T> {
  status: number;
  message: string;
  error: boolean;
  data: T;
}

/** Paginado del backend (PageResponseDto). */
export interface PageResponse<T> {
  content: T[];
  page: number;
  rows: number;
  total: number;
}

/** Request paginado (PageableDto). Reusa la forma de IFilterTable. */
export interface Pageable {
  page: number;
  rows: number;
  search?: string | null;
  order_by?: string | null;
  order?: 'ASC' | 'DESC' | null;
}
