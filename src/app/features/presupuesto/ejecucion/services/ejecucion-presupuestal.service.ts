import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  AfectacionPresupuestalTableModel,
  ApropiarDto,
  CreateAfectacionDto,
  SaldoPresupuestalModel,
} from '../models/ejecucion.model';

@Injectable({ providedIn: 'root' })
export class EjecucionPresupuestalService {
  private readonly http = inject(HttpClient);
  private readonly afectaciones = `${environment.apiUrl}afectaciones-presupuestales`;
  private readonly saldos = `${environment.apiUrl}saldos-presupuestales`;

  registrarAfectacion(dto: CreateAfectacionDto): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(this.afectaciones, dto);
  }
  listAfectaciones(rubroId: number, req: Pageable): Observable<ApiResponse<PageResponse<AfectacionPresupuestalTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<AfectacionPresupuestalTableModel>>>(
      `${this.afectaciones}/rubro/${rubroId}/list`,
      req,
    );
  }

  apropiar(dto: ApropiarDto): Observable<ApiResponse<SaldoPresupuestalModel>> {
    return this.http.post<ApiResponse<SaldoPresupuestalModel>>(`${this.saldos}/apropiar`, dto);
  }
  recalcular(rubroId: number, anio: number): Observable<ApiResponse<SaldoPresupuestalModel>> {
    const params = new HttpParams().set('rubroId', String(rubroId)).set('anio', String(anio));
    return this.http.post<ApiResponse<SaldoPresupuestalModel>>(`${this.saldos}/recalcular`, {}, { params });
  }
  saldo(rubroId: number, anio: number): Observable<ApiResponse<SaldoPresupuestalModel>> {
    const params = new HttpParams().set('rubroId', String(rubroId)).set('anio', String(anio));
    return this.http.get<ApiResponse<SaldoPresupuestalModel>>(this.saldos, { params });
  }
}
