import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateDependenciaDto,
  DependenciaModel,
  DependenciaTableModel,
  UpdateDependenciaDto,
} from '../models/dependencia.model';

@Injectable({ providedIn: 'root' })
export class DependenciaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}dependencias`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<DependenciaTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<DependenciaTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<DependenciaModel>> {
    return this.http.get<ApiResponse<DependenciaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateDependenciaDto): Observable<ApiResponse<DependenciaModel>> {
    return this.http.post<ApiResponse<DependenciaModel>>(this.base, dto);
  }
  update(dto: UpdateDependenciaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
