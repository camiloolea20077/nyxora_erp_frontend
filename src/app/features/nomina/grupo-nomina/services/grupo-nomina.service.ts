import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateGrupoNominaDto,
  GrupoNominaModel,
  GrupoNominaTableModel,
  UpdateGrupoNominaDto,
} from '../models/grupo-nomina.model';

@Injectable({ providedIn: 'root' })
export class GrupoNominaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}grupos-nomina`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<GrupoNominaTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<GrupoNominaTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<GrupoNominaModel>> {
    return this.http.get<ApiResponse<GrupoNominaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateGrupoNominaDto): Observable<ApiResponse<GrupoNominaModel>> {
    return this.http.post<ApiResponse<GrupoNominaModel>>(this.base, dto);
  }
  update(dto: UpdateGrupoNominaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
