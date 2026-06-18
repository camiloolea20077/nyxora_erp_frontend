import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  AddProgramaAsignaturaDto,
  AsignaturaModel,
  AsignaturaTableModel,
  CreateAsignaturaDto,
  ProgramaAsignaturaModel,
  UpdateAsignaturaDto,
} from '../models/asignatura.model';

@Injectable({ providedIn: 'root' })
export class AsignaturaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}asignaturas`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<AsignaturaTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<AsignaturaTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<AsignaturaModel>> {
    return this.http.get<ApiResponse<AsignaturaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateAsignaturaDto): Observable<ApiResponse<AsignaturaModel>> {
    return this.http.post<ApiResponse<AsignaturaModel>>(this.base, dto);
  }
  update(dto: UpdateAsignaturaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }

  // Programas asociados
  listProgramas(id: number): Observable<ApiResponse<ProgramaAsignaturaModel[]>> {
    return this.http.get<ApiResponse<ProgramaAsignaturaModel[]>>(`${this.base}/${id}/programas`);
  }
  addPrograma(id: number, dto: AddProgramaAsignaturaDto): Observable<ApiResponse<ProgramaAsignaturaModel>> {
    return this.http.post<ApiResponse<ProgramaAsignaturaModel>>(`${this.base}/${id}/programas`, dto);
  }
  removePrograma(id: number, enlaceId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}/programas/${enlaceId}`);
  }
}
