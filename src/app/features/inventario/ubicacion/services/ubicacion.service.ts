import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateUbicacionDto,
  UbicacionModel,
  UbicacionTableModel,
  UpdateUbicacionDto,
} from '../models/ubicacion.model';

@Injectable({ providedIn: 'root' })
export class UbicacionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}ubicaciones`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<UbicacionTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<UbicacionTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<UbicacionModel>> {
    return this.http.get<ApiResponse<UbicacionModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateUbicacionDto): Observable<ApiResponse<UbicacionModel>> {
    return this.http.post<ApiResponse<UbicacionModel>>(this.base, dto);
  }
  update(dto: UpdateUbicacionDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
