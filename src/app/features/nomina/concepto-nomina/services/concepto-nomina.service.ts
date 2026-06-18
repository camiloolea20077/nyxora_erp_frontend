import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  ConceptoNominaModel,
  ConceptoNominaTableModel,
  CreateConceptoNominaDto,
  UpdateConceptoNominaDto,
} from '../models/concepto-nomina.model';

@Injectable({ providedIn: 'root' })
export class ConceptoNominaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}conceptos-nomina`;

  list(req: Pageable, clase?: string | null): Observable<ApiResponse<PageResponse<ConceptoNominaTableModel>>> {
    let params = new HttpParams();
    if (clase) params = params.set('clase', clase);
    return this.http.post<ApiResponse<PageResponse<ConceptoNominaTableModel>>>(`${this.base}/list`, req, { params });
  }
  getById(id: number): Observable<ApiResponse<ConceptoNominaModel>> {
    return this.http.get<ApiResponse<ConceptoNominaModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateConceptoNominaDto): Observable<ApiResponse<ConceptoNominaModel>> {
    return this.http.post<ApiResponse<ConceptoNominaModel>>(this.base, dto);
  }
  update(dto: UpdateConceptoNominaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
