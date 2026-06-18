import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  EvaluacionDesempenoCreate,
  EvaluacionDesempenoModel,
  EvaluacionDesempenoTableModel,
  EvaluacionDesempenoUpdate,
} from '../models/talento-humano.model';

/** Evaluaciones de desempeño: /api/evaluaciones-desempeno (filtro opcional empleadoId/programaId). */
@Injectable({ providedIn: 'root' })
export class EvaluacionDesempenoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}evaluaciones-desempeno`;

  list(
    req: Pageable,
    empleadoId?: number | null,
    programaId?: number | null,
  ): Observable<ApiResponse<PageResponse<EvaluacionDesempenoTableModel>>> {
    let params = new HttpParams();
    if (empleadoId != null) params = params.set('empleadoId', String(empleadoId));
    if (programaId != null) params = params.set('programaId', String(programaId));
    return this.http.post<ApiResponse<PageResponse<EvaluacionDesempenoTableModel>>>(
      `${this.base}/list`,
      req,
      { params },
    );
  }
  getById(id: number): Observable<ApiResponse<EvaluacionDesempenoModel>> {
    return this.http.get<ApiResponse<EvaluacionDesempenoModel>>(`${this.base}/${id}`);
  }
  create(dto: EvaluacionDesempenoCreate): Observable<ApiResponse<EvaluacionDesempenoModel>> {
    return this.http.post<ApiResponse<EvaluacionDesempenoModel>>(this.base, dto);
  }
  update(dto: EvaluacionDesempenoUpdate): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
