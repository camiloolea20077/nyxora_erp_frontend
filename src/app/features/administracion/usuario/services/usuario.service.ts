import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  AsignarRolDto,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  UsuarioModel,
  UsuarioTableModel,
} from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}usuarios`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<UsuarioTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<UsuarioTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<UsuarioModel>> {
    return this.http.get<ApiResponse<UsuarioModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateUsuarioDto): Observable<ApiResponse<UsuarioModel>> {
    return this.http.post<ApiResponse<UsuarioModel>>(this.base, dto);
  }
  update(dto: UpdateUsuarioDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
  asignarRol(id: number, dto: AsignarRolDto): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/${id}/roles`, dto);
  }
  quitarRol(id: number, dto: AsignarRolDto): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}/roles`, { body: dto });
  }
}
