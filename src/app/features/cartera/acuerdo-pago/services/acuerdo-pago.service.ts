import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  AcuerdoPagoModel,
  AcuerdoPagoTableModel,
  CreateAcuerdoPagoDto,
} from '../models/acuerdo-pago.model';

@Injectable({ providedIn: 'root' })
export class AcuerdoPagoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}acuerdos-pago`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<AcuerdoPagoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<AcuerdoPagoTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<AcuerdoPagoModel>> {
    return this.http.get<ApiResponse<AcuerdoPagoModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateAcuerdoPagoDto): Observable<ApiResponse<AcuerdoPagoModel>> {
    return this.http.post<ApiResponse<AcuerdoPagoModel>>(this.base, dto);
  }
  anular(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/${id}/anular`, {});
  }
}
