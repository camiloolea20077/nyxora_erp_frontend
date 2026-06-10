import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CategoriaModel,
  CategoriaTableModel,
  CreateCategoriaDto,
  UpdateCategoriaDto,
} from '../models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}categorias`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<CategoriaTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<CategoriaTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<CategoriaModel>> {
    return this.http.get<ApiResponse<CategoriaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateCategoriaDto): Observable<ApiResponse<CategoriaModel>> {
    return this.http.post<ApiResponse<CategoriaModel>>(this.base, dto);
  }
  update(dto: UpdateCategoriaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
