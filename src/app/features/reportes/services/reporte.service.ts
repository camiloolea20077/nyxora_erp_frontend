import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api.model';
import {
  BalanceGeneral,
  CarteraTercero,
  CierrePeriodoResult,
  EjecucionRubro,
  EstadoResultados,
} from '../models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  balanceGeneral(periodoContableId: number): Observable<ApiResponse<BalanceGeneral>> {
    const params = new HttpParams().set('periodoContableId', String(periodoContableId));
    return this.http.get<ApiResponse<BalanceGeneral>>(`${this.base}reportes/balance-general`, { params });
  }
  estadoResultados(periodoContableId: number): Observable<ApiResponse<EstadoResultados>> {
    const params = new HttpParams().set('periodoContableId', String(periodoContableId));
    return this.http.get<ApiResponse<EstadoResultados>>(`${this.base}reportes/estado-resultados`, { params });
  }
  cartera(): Observable<ApiResponse<CarteraTercero[]>> {
    return this.http.get<ApiResponse<CarteraTercero[]>>(`${this.base}reportes/cartera`);
  }
  ejecucionPresupuestal(vigenciaId: number): Observable<ApiResponse<EjecucionRubro[]>> {
    const params = new HttpParams().set('vigenciaId', String(vigenciaId));
    return this.http.get<ApiResponse<EjecucionRubro[]>>(`${this.base}reportes/ejecucion-presupuestal`, { params });
  }
  cerrarPeriodo(periodoContableId: number): Observable<ApiResponse<CierrePeriodoResult>> {
    return this.http.post<ApiResponse<CierrePeriodoResult>>(`${this.base}cierres/periodo/${periodoContableId}`, {});
  }
}
