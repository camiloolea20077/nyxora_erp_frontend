import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CentroCostoModel,
  CentroCostoTableModel,
  CreateCentroCostoDto,
  UpdateCentroCostoDto,
} from '../models/centro-costo.model';

@Injectable({ providedIn: 'root' })
export class CentroCostoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}centros-costo`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<CentroCostoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<CentroCostoTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<CentroCostoModel>> {
    return this.http.get<ApiResponse<CentroCostoModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateCentroCostoDto): Observable<ApiResponse<CentroCostoModel>> {
    return this.http.post<ApiResponse<CentroCostoModel>>(this.base, dto);
  }
  update(dto: UpdateCentroCostoDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
