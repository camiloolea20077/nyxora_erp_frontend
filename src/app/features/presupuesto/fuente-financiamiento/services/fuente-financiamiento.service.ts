import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateFuenteFinanciamientoDto,
  FuenteFinanciamientoModel,
  FuenteFinanciamientoTableModel,
  UpdateFuenteFinanciamientoDto,
} from '../models/fuente-financiamiento.model';

@Injectable({ providedIn: 'root' })
export class FuenteFinanciamientoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}fuentes-financiamiento`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<FuenteFinanciamientoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<FuenteFinanciamientoTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<FuenteFinanciamientoModel>> {
    return this.http.get<ApiResponse<FuenteFinanciamientoModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateFuenteFinanciamientoDto): Observable<ApiResponse<FuenteFinanciamientoModel>> {
    return this.http.post<ApiResponse<FuenteFinanciamientoModel>>(this.base, dto);
  }
  update(dto: UpdateFuenteFinanciamientoDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
