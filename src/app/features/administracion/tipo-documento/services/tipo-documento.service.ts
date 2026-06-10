import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateTipoDocumentoDto,
  TipoDocumentoModel,
  TipoDocumentoTableModel,
  UpdateTipoDocumentoDto,
} from '../models/tipo-documento.model';

@Injectable({ providedIn: 'root' })
export class TipoDocumentoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}tipos-documento`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<TipoDocumentoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<TipoDocumentoTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<TipoDocumentoModel>> {
    return this.http.get<ApiResponse<TipoDocumentoModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateTipoDocumentoDto): Observable<ApiResponse<TipoDocumentoModel>> {
    return this.http.post<ApiResponse<TipoDocumentoModel>>(this.base, dto);
  }
  update(dto: UpdateTipoDocumentoDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
