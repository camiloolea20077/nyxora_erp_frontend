import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateFacturaProveedorDto,
  FacturaProveedorModel,
  FacturaProveedorTableModel,
  RegistrarEventoDto,
  UpdateFacturaProveedorDto,
} from '../models/factura-proveedor.model';

@Injectable({ providedIn: 'root' })
export class FacturaProveedorService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}facturas-proveedor`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<FacturaProveedorTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<FacturaProveedorTableModel>>>(
      `${this.base}/list`,
      req,
    );
  }
  getById(id: number): Observable<ApiResponse<FacturaProveedorModel>> {
    return this.http.get<ApiResponse<FacturaProveedorModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateFacturaProveedorDto): Observable<ApiResponse<FacturaProveedorModel>> {
    return this.http.post<ApiResponse<FacturaProveedorModel>>(this.base, dto);
  }
  update(dto: UpdateFacturaProveedorDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
  registrarEvento(
    id: number,
    dto: RegistrarEventoDto,
  ): Observable<ApiResponse<FacturaProveedorModel>> {
    return this.http.post<ApiResponse<FacturaProveedorModel>>(`${this.base}/${id}/eventos`, dto);
  }
}
