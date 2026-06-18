import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  CreateModalidadContratoDto,
  ModalidadContratoModel,
  ModalidadContratoTableModel,
  UpdateModalidadContratoDto,
} from '../models/modalidad-contrato.model';

@Injectable({ providedIn: 'root' })
export class ModalidadContratoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}modalidades-contrato`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ModalidadContratoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ModalidadContratoTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ModalidadContratoModel>> {
    return this.http.get<ApiResponse<ModalidadContratoModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateModalidadContratoDto): Observable<ApiResponse<ModalidadContratoModel>> {
    return this.http.post<ApiResponse<ModalidadContratoModel>>(this.base, dto);
  }
  update(dto: UpdateModalidadContratoDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
