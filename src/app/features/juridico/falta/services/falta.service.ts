import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import { CreateFaltaDto, FaltaModel, FaltaTableModel, UpdateFaltaDto } from '../models/falta.model';

@Injectable({ providedIn: 'root' })
export class FaltaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}faltas`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<FaltaTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<FaltaTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<FaltaModel>> {
    return this.http.get<ApiResponse<FaltaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateFaltaDto): Observable<ApiResponse<FaltaModel>> {
    return this.http.post<ApiResponse<FaltaModel>>(this.base, dto);
  }
  update(dto: UpdateFaltaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
