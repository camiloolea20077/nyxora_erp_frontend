import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  ClasificacionFaltaModel,
  ClasificacionFaltaTableModel,
  CreateClasificacionFaltaDto,
  UpdateClasificacionFaltaDto,
} from '../models/clasificacion-falta.model';

@Injectable({ providedIn: 'root' })
export class ClasificacionFaltaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}clasificaciones-falta`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ClasificacionFaltaTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ClasificacionFaltaTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ClasificacionFaltaModel>> {
    return this.http.get<ApiResponse<ClasificacionFaltaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateClasificacionFaltaDto): Observable<ApiResponse<ClasificacionFaltaModel>> {
    return this.http.post<ApiResponse<ClasificacionFaltaModel>>(this.base, dto);
  }
  update(dto: UpdateClasificacionFaltaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
