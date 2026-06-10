import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import { CreateRolDto, RolModel, RolTableModel, UpdateRolDto } from '../models/rol.model';

@Injectable({ providedIn: 'root' })
export class RolService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}roles`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<RolTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<RolTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<RolModel>> {
    return this.http.get<ApiResponse<RolModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateRolDto): Observable<ApiResponse<RolModel>> {
    return this.http.post<ApiResponse<RolModel>>(this.base, dto);
  }
  update(dto: UpdateRolDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
