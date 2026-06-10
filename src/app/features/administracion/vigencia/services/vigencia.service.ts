import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateVigenciaDto,
  UpdateVigenciaDto,
  VigenciaModel,
  VigenciaTableModel,
} from '../models/vigencia.model';

@Injectable({ providedIn: 'root' })
export class VigenciaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}vigencias`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<VigenciaTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<VigenciaTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<VigenciaModel>> {
    return this.http.get<ApiResponse<VigenciaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateVigenciaDto): Observable<ApiResponse<VigenciaModel>> {
    return this.http.post<ApiResponse<VigenciaModel>>(this.base, dto);
  }
  update(dto: UpdateVigenciaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
  abrir(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/${id}/abrir`, {});
  }
  cerrar(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/${id}/cerrar`, {});
  }
}
