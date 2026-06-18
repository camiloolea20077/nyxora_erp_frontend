import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  ComprobanteEgresoModel,
  ComprobanteEgresoTableModel,
  CreateEgresoDto,
  GirarEgresoDto,
} from '../models/egreso.model';

@Injectable({ providedIn: 'root' })
export class EgresoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}egresos`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ComprobanteEgresoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ComprobanteEgresoTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ComprobanteEgresoModel>> {
    return this.http.get<ApiResponse<ComprobanteEgresoModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateEgresoDto): Observable<ApiResponse<ComprobanteEgresoModel>> {
    return this.http.post<ApiResponse<ComprobanteEgresoModel>>(this.base, dto);
  }
  girar(id: number, dto: GirarEgresoDto): Observable<ApiResponse<ComprobanteEgresoModel>> {
    return this.http.post<ApiResponse<ComprobanteEgresoModel>>(`${this.base}/${id}/girar`, dto);
  }
  anular(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/${id}/anular`, {});
  }
}
