import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import { CreatePeriodoDto, PeriodoModel, PeriodoTableModel } from '../models/periodo.model';

@Injectable({ providedIn: 'root' })
export class PeriodoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}periodos-contables`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<PeriodoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<PeriodoTableModel>>>(`${this.base}/list`, req);
  }
  create(dto: CreatePeriodoDto): Observable<ApiResponse<PeriodoModel>> {
    return this.http.post<ApiResponse<PeriodoModel>>(this.base, dto);
  }
  cerrar(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/${id}/cerrar`, {});
  }
  reabrir(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/${id}/reabrir`, {});
  }
}
