import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import { ComprobanteModel, ComprobanteTableModel, CreateComprobanteDto } from '../models/comprobante.model';

@Injectable({ providedIn: 'root' })
export class ComprobanteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}comprobantes`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ComprobanteTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ComprobanteTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ComprobanteModel>> {
    return this.http.get<ApiResponse<ComprobanteModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateComprobanteDto): Observable<ApiResponse<ComprobanteModel>> {
    return this.http.post<ApiResponse<ComprobanteModel>>(this.base, dto);
  }
  confirmar(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/${id}/confirmar`, {});
  }
  reversar(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/${id}/reversar`, {});
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
