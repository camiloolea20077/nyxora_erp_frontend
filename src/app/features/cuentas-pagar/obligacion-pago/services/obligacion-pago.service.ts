import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateObligacionPagoDto,
  ObligacionPagoModel,
  ObligacionPagoTableModel,
} from '../models/obligacion-pago.model';

@Injectable({ providedIn: 'root' })
export class ObligacionPagoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}obligaciones-pago`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ObligacionPagoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ObligacionPagoTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ObligacionPagoModel>> {
    return this.http.get<ApiResponse<ObligacionPagoModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateObligacionPagoDto): Observable<ApiResponse<ObligacionPagoModel>> {
    return this.http.post<ApiResponse<ObligacionPagoModel>>(this.base, dto);
  }
  anular(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/${id}/anular`, {});
  }
}
