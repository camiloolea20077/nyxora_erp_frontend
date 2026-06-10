import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import { CreateProductoDto, ProductoModel, ProductoTableModel, UpdateProductoDto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}productos`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ProductoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ProductoTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ProductoModel>> {
    return this.http.get<ApiResponse<ProductoModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateProductoDto): Observable<ApiResponse<ProductoModel>> {
    return this.http.post<ApiResponse<ProductoModel>>(this.base, dto);
  }
  update(dto: UpdateProductoDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
