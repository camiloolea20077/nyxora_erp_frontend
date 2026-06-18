import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateEvaluacionProgramaDto,
  EvaluacionProgramaModel,
  EvaluacionProgramaTableModel,
  UpdateEvaluacionProgramaDto,
} from '../models/evaluacion-programa.model';

@Injectable({ providedIn: 'root' })
export class EvaluacionProgramaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}evaluacion-programas`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<EvaluacionProgramaTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<EvaluacionProgramaTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<EvaluacionProgramaModel>> {
    return this.http.get<ApiResponse<EvaluacionProgramaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateEvaluacionProgramaDto): Observable<ApiResponse<EvaluacionProgramaModel>> {
    return this.http.post<ApiResponse<EvaluacionProgramaModel>>(this.base, dto);
  }
  update(dto: UpdateEvaluacionProgramaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
