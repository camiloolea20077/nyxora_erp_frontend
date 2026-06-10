import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../shared/models/api.model';
import { SaldoInventarioModel } from '../models/existencia.model';

@Injectable({ providedIn: 'root' })
export class ExistenciaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}saldos-inventario`;

  consultar(bodegaId: number, productoId?: number | null): Observable<ApiResponse<SaldoInventarioModel[]>> {
    let params = new HttpParams().set('bodegaId', String(bodegaId));
    if (productoId != null) {
      params = params.set('productoId', String(productoId));
    }
    return this.http.get<ApiResponse<SaldoInventarioModel[]>>(this.base, { params });
  }

  recalcular(bodegaId: number): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.base}/recalcular`, { bodegaId });
  }
}
