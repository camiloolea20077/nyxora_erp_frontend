import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import { CreateProyectoDto, ProyectoModel, ProyectoTableModel, UpdateProyectoDto } from '../models/proyecto.model';

@Injectable({ providedIn: 'root' })
export class ProyectoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}proyectos`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ProyectoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ProyectoTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ProyectoModel>> {
    return this.http.get<ApiResponse<ProyectoModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateProyectoDto): Observable<ApiResponse<ProyectoModel>> {
    return this.http.post<ApiResponse<ProyectoModel>>(this.base, dto);
  }
  update(dto: UpdateProyectoDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
