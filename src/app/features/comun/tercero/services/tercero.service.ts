import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse } from '../../../../shared/models/api.model';
import {
  CreateTerceroDto,
  TerceroModel,
  TerceroPageable,
  TerceroTableModel,
  UpdateTerceroDto,
} from '../models/tercero.model';

@Injectable({ providedIn: 'root' })
export class TerceroService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}terceros`;

  list(req: TerceroPageable): Observable<ApiResponse<PageResponse<TerceroTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<TerceroTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<TerceroModel>> {
    return this.http.get<ApiResponse<TerceroModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateTerceroDto): Observable<ApiResponse<TerceroModel>> {
    return this.http.post<ApiResponse<TerceroModel>>(this.base, dto);
  }
  update(dto: UpdateTerceroDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
