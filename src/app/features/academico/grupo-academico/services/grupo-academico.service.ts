import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateGrupoAcademicoDto,
  GrupoAcademicoModel,
  GrupoAcademicoTableModel,
  UpdateGrupoAcademicoDto,
} from '../models/grupo-academico.model';

@Injectable({ providedIn: 'root' })
export class GrupoAcademicoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}grupos-academicos`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<GrupoAcademicoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<GrupoAcademicoTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<GrupoAcademicoModel>> {
    return this.http.get<ApiResponse<GrupoAcademicoModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateGrupoAcademicoDto): Observable<ApiResponse<GrupoAcademicoModel>> {
    return this.http.post<ApiResponse<GrupoAcademicoModel>>(this.base, dto);
  }
  update(dto: UpdateGrupoAcademicoDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
