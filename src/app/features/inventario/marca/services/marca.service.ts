import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import { CreateMarcaDto, MarcaModel, MarcaTableModel, UpdateMarcaDto } from '../models/marca.model';

@Injectable({ providedIn: 'root' })
export class MarcaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}marcas`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<MarcaTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<MarcaTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<MarcaModel>> {
    return this.http.get<ApiResponse<MarcaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateMarcaDto): Observable<ApiResponse<MarcaModel>> {
    return this.http.post<ApiResponse<MarcaModel>>(this.base, dto);
  }
  update(dto: UpdateMarcaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
