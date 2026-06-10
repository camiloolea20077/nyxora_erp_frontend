import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateOrdenCompraDto,
  OrdenCompraModel,
  OrdenCompraTableModel,
  UpdateOrdenCompraDto,
} from '../models/orden-compra.model';

@Injectable({ providedIn: 'root' })
export class OrdenCompraService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}ordenes-compra`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<OrdenCompraTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<OrdenCompraTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<OrdenCompraModel>> {
    return this.http.get<ApiResponse<OrdenCompraModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateOrdenCompraDto): Observable<ApiResponse<OrdenCompraModel>> {
    return this.http.post<ApiResponse<OrdenCompraModel>>(this.base, dto);
  }
  update(dto: UpdateOrdenCompraDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
  aprobar(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/${id}/aprobar`, {});
  }
  anular(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/${id}/anular`, {});
  }
}
