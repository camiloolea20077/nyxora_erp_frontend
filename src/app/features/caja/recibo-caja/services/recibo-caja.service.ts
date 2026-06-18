import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateReciboCajaDto,
  ReciboCajaModel,
  ReciboCajaTableModel,
} from '../models/recibo-caja.model';

@Injectable({ providedIn: 'root' })
export class ReciboCajaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}recibos-caja`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ReciboCajaTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ReciboCajaTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ReciboCajaModel>> {
    return this.http.get<ApiResponse<ReciboCajaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateReciboCajaDto): Observable<ApiResponse<ReciboCajaModel>> {
    return this.http.post<ApiResponse<ReciboCajaModel>>(this.base, dto);
  }
  anular(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/${id}/anular`, {});
  }
}
