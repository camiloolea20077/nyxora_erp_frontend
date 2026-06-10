import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateImpuestoDto,
  ImpuestoModel,
  ImpuestoTableModel,
  UpdateImpuestoDto,
} from '../models/impuesto.model';

@Injectable({ providedIn: 'root' })
export class ImpuestoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}impuestos`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ImpuestoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ImpuestoTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ImpuestoModel>> {
    return this.http.get<ApiResponse<ImpuestoModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateImpuestoDto): Observable<ApiResponse<ImpuestoModel>> {
    return this.http.post<ApiResponse<ImpuestoModel>>(this.base, dto);
  }
  update(dto: UpdateImpuestoDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
