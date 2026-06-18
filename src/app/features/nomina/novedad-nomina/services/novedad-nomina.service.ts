import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateNovedadNominaDto,
  NovedadNominaModel,
  NovedadNominaTableModel,
  UpdateNovedadNominaDto,
} from '../models/novedad-nomina.model';

@Injectable({ providedIn: 'root' })
export class NovedadNominaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}novedades-nomina`;

  list(req: Pageable, vinculacionId?: number | null): Observable<ApiResponse<PageResponse<NovedadNominaTableModel>>> {
    let params = new HttpParams();
    if (vinculacionId != null) params = params.set('vinculacionId', String(vinculacionId));
    return this.http.post<ApiResponse<PageResponse<NovedadNominaTableModel>>>(`${this.base}/list`, req, { params });
  }
  getById(id: number): Observable<ApiResponse<NovedadNominaModel>> {
    return this.http.get<ApiResponse<NovedadNominaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateNovedadNominaDto): Observable<ApiResponse<NovedadNominaModel>> {
    return this.http.post<ApiResponse<NovedadNominaModel>>(this.base, dto);
  }
  update(dto: UpdateNovedadNominaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  anular(id: number): Observable<ApiResponse<NovedadNominaModel>> {
    return this.http.post<ApiResponse<NovedadNominaModel>>(`${this.base}/${id}/anular`, {});
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
