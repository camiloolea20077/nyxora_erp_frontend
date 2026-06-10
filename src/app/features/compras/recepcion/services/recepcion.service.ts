import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  ConfirmarRecepcionDto,
  CreateRecepcionDto,
  RecepcionModel,
  RecepcionTableModel,
} from '../models/recepcion.model';

@Injectable({ providedIn: 'root' })
export class RecepcionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}recepciones`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<RecepcionTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<RecepcionTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<RecepcionModel>> {
    return this.http.get<ApiResponse<RecepcionModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateRecepcionDto): Observable<ApiResponse<RecepcionModel>> {
    return this.http.post<ApiResponse<RecepcionModel>>(this.base, dto);
  }
  confirmar(id: number, dto: ConfirmarRecepcionDto): Observable<ApiResponse<RecepcionModel>> {
    return this.http.post<ApiResponse<RecepcionModel>>(`${this.base}/${id}/confirmar`, dto);
  }
}
