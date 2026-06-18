import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  AportePila,
  ContabilizarNominaDto,
  CreateLiquidacionNominaDto,
  LiquidacionDetalle,
  LiquidacionNominaModel,
  LiquidacionNominaTableModel,
  LiquidarNominaDto,
  UpdateLiquidacionNominaDto,
} from '../models/liquidacion-nomina.model';

@Injectable({ providedIn: 'root' })
export class LiquidacionNominaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}liquidaciones-nomina`;

  list(
    req: Pageable,
    grupoNominaId?: number | null,
  ): Observable<ApiResponse<PageResponse<LiquidacionNominaTableModel>>> {
    let params = new HttpParams();
    if (grupoNominaId != null) params = params.set('grupoNominaId', String(grupoNominaId));
    return this.http.post<ApiResponse<PageResponse<LiquidacionNominaTableModel>>>(
      `${this.base}/list`,
      req,
      { params },
    );
  }
  getById(id: number): Observable<ApiResponse<LiquidacionNominaModel>> {
    return this.http.get<ApiResponse<LiquidacionNominaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateLiquidacionNominaDto): Observable<ApiResponse<LiquidacionNominaModel>> {
    return this.http.post<ApiResponse<LiquidacionNominaModel>>(this.base, dto);
  }
  update(dto: UpdateLiquidacionNominaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
  liquidar(id: number, dto: LiquidarNominaDto): Observable<ApiResponse<LiquidacionNominaModel>> {
    return this.http.post<ApiResponse<LiquidacionNominaModel>>(`${this.base}/${id}/liquidar`, dto);
  }
  contabilizar(
    id: number,
    dto: ContabilizarNominaDto,
  ): Observable<ApiResponse<LiquidacionNominaModel>> {
    return this.http.post<ApiResponse<LiquidacionNominaModel>>(
      `${this.base}/${id}/contabilizar`,
      dto,
    );
  }
  anular(id: number): Observable<ApiResponse<LiquidacionNominaModel>> {
    return this.http.post<ApiResponse<LiquidacionNominaModel>>(`${this.base}/${id}/anular`, {});
  }
  listDetalle(id: number): Observable<ApiResponse<LiquidacionDetalle[]>> {
    return this.http.get<ApiResponse<LiquidacionDetalle[]>>(`${this.base}/${id}/detalle`);
  }
  listPila(id: number): Observable<ApiResponse<AportePila[]>> {
    return this.http.get<ApiResponse<AportePila[]>>(`${this.base}/${id}/pila`);
  }
}
