import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateResolucionDianDto,
  ResolucionDianModel,
  ResolucionDianTableModel,
  UpdateResolucionDianDto,
} from '../models/resolucion-dian.model';

@Injectable({ providedIn: 'root' })
export class ResolucionDianService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}resoluciones-dian`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ResolucionDianTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ResolucionDianTableModel>>>(
      `${this.base}/list`,
      req,
    );
  }
  getById(id: number): Observable<ApiResponse<ResolucionDianModel>> {
    return this.http.get<ApiResponse<ResolucionDianModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateResolucionDianDto): Observable<ApiResponse<ResolucionDianModel>> {
    return this.http.post<ApiResponse<ResolucionDianModel>>(this.base, dto);
  }
  update(dto: UpdateResolucionDianDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
