import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateFacturaDto,
  EmitirFacturaDto,
  FacturaDianModel,
  FacturaModel,
  FacturaTableModel,
  RegistrarFacturaDianDto,
  UpdateFacturaDto,
} from '../models/factura.model';

@Injectable({ providedIn: 'root' })
export class FacturaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}facturas`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<FacturaTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<FacturaTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<FacturaModel>> {
    return this.http.get<ApiResponse<FacturaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateFacturaDto): Observable<ApiResponse<FacturaModel>> {
    return this.http.post<ApiResponse<FacturaModel>>(this.base, dto);
  }
  update(dto: UpdateFacturaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
  emitir(id: number, dto: EmitirFacturaDto): Observable<ApiResponse<FacturaModel>> {
    return this.http.post<ApiResponse<FacturaModel>>(`${this.base}/${id}/emitir`, dto);
  }
  anular(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/${id}/anular`, {});
  }
  registrarDian(id: number, dto: RegistrarFacturaDianDto): Observable<ApiResponse<FacturaDianModel>> {
    return this.http.post<ApiResponse<FacturaDianModel>>(`${this.base}/${id}/dian`, dto);
  }
}
