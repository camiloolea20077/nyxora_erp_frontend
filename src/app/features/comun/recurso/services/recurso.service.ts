import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import { CreateRecursoDto, RecursoModel, RecursoTableModel, UpdateRecursoDto } from '../models/recurso.model';

@Injectable({ providedIn: 'root' })
export class RecursoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}recursos`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<RecursoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<RecursoTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<RecursoModel>> {
    return this.http.get<ApiResponse<RecursoModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateRecursoDto): Observable<ApiResponse<RecursoModel>> {
    return this.http.post<ApiResponse<RecursoModel>>(this.base, dto);
  }
  update(dto: UpdateRecursoDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
