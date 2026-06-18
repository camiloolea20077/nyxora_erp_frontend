import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  ActivoFijoModel,
  ActivoFijoTableModel,
  AsignarPolizaDto,
  AsignarResponsableDto,
  CreateActivoFijoDto,
  CreateDepreciacionDto,
  DepreciacionModel,
  DepreciacionTableModel,
  UpdateActivoFijoDto,
} from '../models/activo-fijo.model';

@Injectable({ providedIn: 'root' })
export class ActivoFijoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}activos-fijos`;
  private readonly depBase = `${environment.apiUrl}depreciaciones`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ActivoFijoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ActivoFijoTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ActivoFijoModel>> {
    return this.http.get<ApiResponse<ActivoFijoModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateActivoFijoDto): Observable<ApiResponse<ActivoFijoModel>> {
    return this.http.post<ApiResponse<ActivoFijoModel>>(this.base, dto);
  }
  update(dto: UpdateActivoFijoDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }

  asignarResponsable(id: number, dto: AsignarResponsableDto): Observable<ApiResponse<ActivoFijoModel>> {
    return this.http.post<ApiResponse<ActivoFijoModel>>(`${this.base}/${id}/responsables`, dto);
  }
  removerResponsable(id: number, terceroId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}/responsables/${terceroId}`);
  }
  asignarPoliza(id: number, dto: AsignarPolizaDto): Observable<ApiResponse<ActivoFijoModel>> {
    return this.http.post<ApiResponse<ActivoFijoModel>>(`${this.base}/${id}/polizas`, dto);
  }
  removerPoliza(id: number, polizaSeguroId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}/polizas/${polizaSeguroId}`);
  }

  registrarDepreciacion(dto: CreateDepreciacionDto): Observable<ApiResponse<DepreciacionModel>> {
    return this.http.post<ApiResponse<DepreciacionModel>>(this.depBase, dto);
  }
  listDepreciaciones(
    activoFijoId: number,
    req: Pageable,
  ): Observable<ApiResponse<PageResponse<DepreciacionTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<DepreciacionTableModel>>>(
      `${this.depBase}/activo/${activoFijoId}/list`,
      req,
    );
  }
}
