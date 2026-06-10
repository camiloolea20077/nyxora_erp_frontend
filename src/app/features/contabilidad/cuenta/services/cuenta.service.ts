import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import { CreateCuentaDto, CuentaModel, CuentaTableModel, UpdateCuentaDto } from '../models/cuenta.model';

@Injectable({ providedIn: 'root' })
export class CuentaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}cuentas`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<CuentaTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<CuentaTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<CuentaModel>> {
    return this.http.get<ApiResponse<CuentaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateCuentaDto): Observable<ApiResponse<CuentaModel>> {
    return this.http.post<ApiResponse<CuentaModel>>(this.base, dto);
  }
  update(dto: UpdateCuentaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
