import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  ChequeraModel,
  ChequeraTableModel,
  CreateChequeraDto,
  UpdateChequeraDto,
} from '../models/chequera.model';

@Injectable({ providedIn: 'root' })
export class ChequeraService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}chequeras`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ChequeraTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ChequeraTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ChequeraModel>> {
    return this.http.get<ApiResponse<ChequeraModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateChequeraDto): Observable<ApiResponse<ChequeraModel>> {
    return this.http.post<ApiResponse<ChequeraModel>>(this.base, dto);
  }
  update(dto: UpdateChequeraDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
