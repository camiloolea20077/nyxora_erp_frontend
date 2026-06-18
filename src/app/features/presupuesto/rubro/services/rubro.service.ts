import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateRubroPresupuestalDto,
  RubroPresupuestalModel,
  RubroPresupuestalTableModel,
  UpdateRubroPresupuestalDto,
} from '../models/rubro.model';

@Injectable({ providedIn: 'root' })
export class RubroPresupuestalService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}rubros-presupuestales`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<RubroPresupuestalTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<RubroPresupuestalTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<RubroPresupuestalModel>> {
    return this.http.get<ApiResponse<RubroPresupuestalModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateRubroPresupuestalDto): Observable<ApiResponse<RubroPresupuestalModel>> {
    return this.http.post<ApiResponse<RubroPresupuestalModel>>(this.base, dto);
  }
  update(dto: UpdateRubroPresupuestalDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
