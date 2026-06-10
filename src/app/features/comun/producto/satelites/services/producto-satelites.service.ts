import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../../environments/environment';
import { ApiResponse } from '../../../../../shared/models/api.model';
import {
  ProveedorCreate,
  ProveedorModel,
  ProveedorUpdate,
  VarianteCreate,
  VarianteModel,
  VarianteUpdate,
} from '../models/producto-satelite.model';

@Injectable({ providedIn: 'root' })
export class ProductoSatelitesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}productos`;

  // Variantes
  listVariantes(pid: number): Observable<ApiResponse<VarianteModel[]>> {
    return this.http.get<ApiResponse<VarianteModel[]>>(`${this.base}/${pid}/variantes`);
  }
  createVariante(pid: number, dto: VarianteCreate): Observable<ApiResponse<VarianteModel>> {
    return this.http.post<ApiResponse<VarianteModel>>(`${this.base}/${pid}/variantes`, dto);
  }
  updateVariante(pid: number, dto: VarianteUpdate): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.base}/${pid}/variantes`, dto);
  }
  deleteVariante(pid: number, id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${pid}/variantes/${id}`);
  }

  // Proveedores
  listProveedores(pid: number): Observable<ApiResponse<ProveedorModel[]>> {
    return this.http.get<ApiResponse<ProveedorModel[]>>(`${this.base}/${pid}/proveedores`);
  }
  createProveedor(pid: number, dto: ProveedorCreate): Observable<ApiResponse<ProveedorModel>> {
    return this.http.post<ApiResponse<ProveedorModel>>(`${this.base}/${pid}/proveedores`, dto);
  }
  updateProveedor(pid: number, dto: ProveedorUpdate): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.base}/${pid}/proveedores`, dto);
  }
  deleteProveedor(pid: number, id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${pid}/proveedores/${id}`);
  }
}
