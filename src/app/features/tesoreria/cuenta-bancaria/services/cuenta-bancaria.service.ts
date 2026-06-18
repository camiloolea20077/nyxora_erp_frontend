import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateCuentaBancariaDto,
  CuentaBancariaModel,
  CuentaBancariaTableModel,
  UpdateCuentaBancariaDto,
} from '../models/cuenta-bancaria.model';

@Injectable({ providedIn: 'root' })
export class CuentaBancariaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}cuentas-bancarias`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<CuentaBancariaTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<CuentaBancariaTableModel>>>(
      `${this.base}/list`,
      req,
    );
  }
  getById(id: number): Observable<ApiResponse<CuentaBancariaModel>> {
    return this.http.get<ApiResponse<CuentaBancariaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateCuentaBancariaDto): Observable<ApiResponse<CuentaBancariaModel>> {
    return this.http.post<ApiResponse<CuentaBancariaModel>>(this.base, dto);
  }
  update(dto: UpdateCuentaBancariaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
