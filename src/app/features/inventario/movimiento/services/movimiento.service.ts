import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../shared/models/api.model';
import { CreateMovimientoDto, KardexItem } from '../models/movimiento.model';

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}movimientos-inventario`;

  create(dto: CreateMovimientoDto): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(this.base, dto);
  }
  reversar(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/${id}/reversar`, {});
  }
  kardex(productoId: number, bodegaId?: number | null): Observable<ApiResponse<KardexItem[]>> {
    let params = new HttpParams().set('productoId', String(productoId));
    if (bodegaId != null) {
      params = params.set('bodegaId', String(bodegaId));
    }
    return this.http.get<ApiResponse<KardexItem[]>>(`${this.base}/kardex`, { params });
  }
}
