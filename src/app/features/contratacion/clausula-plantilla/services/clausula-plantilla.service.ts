import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  ClausulaPlantillaModel,
  ClausulaPlantillaTableModel,
  CreateClausulaPlantillaDto,
  UpdateClausulaPlantillaDto,
} from '../models/clausula-plantilla.model';

@Injectable({ providedIn: 'root' })
export class ClausulaPlantillaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}clausulas-plantilla`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ClausulaPlantillaTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ClausulaPlantillaTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ClausulaPlantillaModel>> {
    return this.http.get<ApiResponse<ClausulaPlantillaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateClausulaPlantillaDto): Observable<ApiResponse<ClausulaPlantillaModel>> {
    return this.http.post<ApiResponse<ClausulaPlantillaModel>>(this.base, dto);
  }
  update(dto: UpdateClausulaPlantillaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
