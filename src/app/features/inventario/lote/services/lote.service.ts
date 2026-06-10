import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import { CreateLoteDto, LoteModel, LoteTableModel, UpdateLoteDto } from '../models/lote.model';

@Injectable({ providedIn: 'root' })
export class LoteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}lotes`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<LoteTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<LoteTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<LoteModel>> {
    return this.http.get<ApiResponse<LoteModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateLoteDto): Observable<ApiResponse<LoteModel>> {
    return this.http.post<ApiResponse<LoteModel>>(this.base, dto);
  }
  update(dto: UpdateLoteDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
