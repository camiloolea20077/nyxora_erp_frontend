import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateCuentaPorCobrarDto,
  CuentaPorCobrarModel,
  CuentaPorCobrarTableModel,
} from '../models/cuenta-cobrar.model';

@Injectable({ providedIn: 'root' })
export class CuentaCobrarService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}cuentas-cobrar`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<CuentaPorCobrarTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<CuentaPorCobrarTableModel>>>(
      `${this.base}/list`,
      req,
    );
  }
  getById(id: number): Observable<ApiResponse<CuentaPorCobrarModel>> {
    return this.http.get<ApiResponse<CuentaPorCobrarModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateCuentaPorCobrarDto): Observable<ApiResponse<CuentaPorCobrarModel>> {
    return this.http.post<ApiResponse<CuentaPorCobrarModel>>(this.base, dto);
  }
}
