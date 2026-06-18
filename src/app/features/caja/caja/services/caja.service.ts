import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  AbrirCajaDto,
  CajaModel,
  CajaTableModel,
  CreateCajaDto,
  UpdateCajaDto,
} from '../models/caja.model';

@Injectable({ providedIn: 'root' })
export class CajaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}cajas`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<CajaTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<CajaTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<CajaModel>> {
    return this.http.get<ApiResponse<CajaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateCajaDto): Observable<ApiResponse<CajaModel>> {
    return this.http.post<ApiResponse<CajaModel>>(this.base, dto);
  }
  update(dto: UpdateCajaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
  abrir(id: number, dto: AbrirCajaDto): Observable<ApiResponse<CajaModel>> {
    return this.http.post<ApiResponse<CajaModel>>(`${this.base}/${id}/abrir`, dto);
  }
  cerrar(id: number): Observable<ApiResponse<CajaModel>> {
    return this.http.post<ApiResponse<CajaModel>>(`${this.base}/${id}/cerrar`, {});
  }
}
