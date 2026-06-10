import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../shared/models/api.model';
import { SaldoModel } from '../models/saldo.model';

@Injectable({ providedIn: 'root' })
export class SaldoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}saldos`;

  consultar(periodoContableId: number, cuentaId?: number | null): Observable<ApiResponse<SaldoModel[]>> {
    let params = new HttpParams().set('periodoContableId', String(periodoContableId));
    if (cuentaId != null) {
      params = params.set('cuentaId', String(cuentaId));
    }
    return this.http.get<ApiResponse<SaldoModel[]>>(this.base, { params });
  }

  recalcular(periodoContableId: number): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.base}/recalcular`, { periodoContableId });
  }
}
