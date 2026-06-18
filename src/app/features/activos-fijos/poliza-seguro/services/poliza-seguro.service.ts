import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreatePolizaSeguroDto,
  PolizaSeguroModel,
  PolizaSeguroTableModel,
  UpdatePolizaSeguroDto,
} from '../models/poliza-seguro.model';

@Injectable({ providedIn: 'root' })
export class PolizaSeguroService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}polizas-seguro`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<PolizaSeguroTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<PolizaSeguroTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<PolizaSeguroModel>> {
    return this.http.get<ApiResponse<PolizaSeguroModel>>(`${this.base}/${id}`);
  }
  create(dto: CreatePolizaSeguroDto): Observable<ApiResponse<PolizaSeguroModel>> {
    return this.http.post<ApiResponse<PolizaSeguroModel>>(this.base, dto);
  }
  update(dto: UpdatePolizaSeguroDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
