import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  AsignarPolizaContratoDto,
  CambiarEstadoContratoDto,
  ContratoModel,
  ContratoTableModel,
  CreateContratoDto,
  UpdateContratoDto,
} from '../models/contrato.model';

@Injectable({ providedIn: 'root' })
export class ContratoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}contratos`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ContratoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ContratoTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ContratoModel>> {
    return this.http.get<ApiResponse<ContratoModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateContratoDto): Observable<ApiResponse<ContratoModel>> {
    return this.http.post<ApiResponse<ContratoModel>>(this.base, dto);
  }
  update(dto: UpdateContratoDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
  cambiarEstado(id: number, dto: CambiarEstadoContratoDto): Observable<ApiResponse<ContratoModel>> {
    return this.http.post<ApiResponse<ContratoModel>>(`${this.base}/${id}/estado`, dto);
  }
  asignarPoliza(id: number, dto: AsignarPolizaContratoDto): Observable<ApiResponse<ContratoModel>> {
    return this.http.post<ApiResponse<ContratoModel>>(`${this.base}/${id}/polizas`, dto);
  }
  removerPoliza(id: number, polizaSeguroId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}/polizas/${polizaSeguroId}`);
  }
}
