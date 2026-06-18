import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateVinculacionDto,
  UpdateVinculacionDto,
  VinculacionModel,
  VinculacionTableModel,
} from '../models/vinculacion.model';

@Injectable({ providedIn: 'root' })
export class VinculacionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}vinculaciones`;

  list(req: Pageable, empleadoId?: number | null): Observable<ApiResponse<PageResponse<VinculacionTableModel>>> {
    let params = new HttpParams();
    if (empleadoId != null) params = params.set('empleadoId', String(empleadoId));
    return this.http.post<ApiResponse<PageResponse<VinculacionTableModel>>>(`${this.base}/list`, req, { params });
  }
  getById(id: number): Observable<ApiResponse<VinculacionModel>> {
    return this.http.get<ApiResponse<VinculacionModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateVinculacionDto): Observable<ApiResponse<VinculacionModel>> {
    return this.http.post<ApiResponse<VinculacionModel>>(this.base, dto);
  }
  update(dto: UpdateVinculacionDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
