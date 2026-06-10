import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import { CreateSedeDto, SedeModel, SedeTableModel, UpdateSedeDto } from '../models/sede.model';

@Injectable({ providedIn: 'root' })
export class SedeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}sedes`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<SedeTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<SedeTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<SedeModel>> {
    return this.http.get<ApiResponse<SedeModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateSedeDto): Observable<ApiResponse<SedeModel>> {
    return this.http.post<ApiResponse<SedeModel>>(this.base, dto);
  }
  update(dto: UpdateSedeDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
