import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateParametroDto,
  ParametroModel,
  ParametroTableModel,
  UpdateParametroDto,
} from '../models/parametro.model';

@Injectable({ providedIn: 'root' })
export class ParametroService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}parametros`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ParametroTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ParametroTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ParametroModel>> {
    return this.http.get<ApiResponse<ParametroModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateParametroDto): Observable<ApiResponse<ParametroModel>> {
    return this.http.post<ApiResponse<ParametroModel>>(this.base, dto);
  }
  update(dto: UpdateParametroDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
