import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  BodegaModel,
  BodegaResponsableCreate,
  BodegaResponsableModel,
  BodegaTableModel,
  CreateBodegaDto,
  UpdateBodegaDto,
} from '../models/bodega.model';

@Injectable({ providedIn: 'root' })
export class BodegaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}bodegas`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<BodegaTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<BodegaTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<BodegaModel>> {
    return this.http.get<ApiResponse<BodegaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateBodegaDto): Observable<ApiResponse<BodegaModel>> {
    return this.http.post<ApiResponse<BodegaModel>>(this.base, dto);
  }
  update(dto: UpdateBodegaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }

  // Responsables (terceros asignados a la bodega)
  listResponsables(bodegaId: number): Observable<ApiResponse<BodegaResponsableModel[]>> {
    return this.http.get<ApiResponse<BodegaResponsableModel[]>>(`${this.base}/${bodegaId}/responsables`);
  }
  createResponsable(
    bodegaId: number,
    dto: BodegaResponsableCreate,
  ): Observable<ApiResponse<BodegaResponsableModel>> {
    return this.http.post<ApiResponse<BodegaResponsableModel>>(`${this.base}/${bodegaId}/responsables`, dto);
  }
  deleteResponsable(bodegaId: number, id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${bodegaId}/responsables/${id}`);
  }
}
