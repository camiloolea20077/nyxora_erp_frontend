import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import { CpcModel, CpcTableModel, CreateCpcDto, UpdateCpcDto } from '../models/cpc.model';

@Injectable({ providedIn: 'root' })
export class CpcService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}cpc`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<CpcTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<CpcTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<CpcModel>> {
    return this.http.get<ApiResponse<CpcModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateCpcDto): Observable<ApiResponse<CpcModel>> {
    return this.http.post<ApiResponse<CpcModel>>(this.base, dto);
  }
  update(dto: UpdateCpcDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
