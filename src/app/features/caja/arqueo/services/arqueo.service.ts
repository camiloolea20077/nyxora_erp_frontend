import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import { ArqueoModel, ArqueoTableModel, CreateArqueoDto } from '../models/arqueo.model';

@Injectable({ providedIn: 'root' })
export class ArqueoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}arqueos`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ArqueoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ArqueoTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ArqueoModel>> {
    return this.http.get<ApiResponse<ArqueoModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateArqueoDto): Observable<ApiResponse<ArqueoModel>> {
    return this.http.post<ApiResponse<ArqueoModel>>(this.base, dto);
  }
}
