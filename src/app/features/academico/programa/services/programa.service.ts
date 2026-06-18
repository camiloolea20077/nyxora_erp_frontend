import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import { CreateProgramaDto, ProgramaModel, ProgramaTableModel, UpdateProgramaDto } from '../models/programa.model';

@Injectable({ providedIn: 'root' })
export class ProgramaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}programas-academicos`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ProgramaTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ProgramaTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ProgramaModel>> {
    return this.http.get<ApiResponse<ProgramaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateProgramaDto): Observable<ApiResponse<ProgramaModel>> {
    return this.http.post<ApiResponse<ProgramaModel>>(this.base, dto);
  }
  update(dto: UpdateProgramaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
