import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CargaAcademicaModel,
  CargaAcademicaTableModel,
  CreateCargaAcademicaDto,
  GenerarNovedadDocenteDto,
  UpdateCargaAcademicaDto,
} from '../models/carga-academica.model';

@Injectable({ providedIn: 'root' })
export class CargaAcademicaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}cargas-academicas`;

  list(req: Pageable, vinculacionId?: number | null): Observable<ApiResponse<PageResponse<CargaAcademicaTableModel>>> {
    let params = new HttpParams();
    if (vinculacionId != null) params = params.set('vinculacionId', String(vinculacionId));
    return this.http.post<ApiResponse<PageResponse<CargaAcademicaTableModel>>>(`${this.base}/list`, req, { params });
  }
  getById(id: number): Observable<ApiResponse<CargaAcademicaModel>> {
    return this.http.get<ApiResponse<CargaAcademicaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateCargaAcademicaDto): Observable<ApiResponse<CargaAcademicaModel>> {
    return this.http.post<ApiResponse<CargaAcademicaModel>>(this.base, dto);
  }
  update(dto: UpdateCargaAcademicaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
  generarNovedad(id: number, dto: GenerarNovedadDocenteDto): Observable<ApiResponse<CargaAcademicaModel>> {
    return this.http.post<ApiResponse<CargaAcademicaModel>>(`${this.base}/${id}/generar-novedad`, dto);
  }
}
