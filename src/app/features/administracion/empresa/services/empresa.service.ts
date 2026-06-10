import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../shared/models/api.model';
import { EmpresaModel, UpdateEmpresaDto } from '../models/empresa.model';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}empresas`;

  /** Mi empresa (la del token, sin saber el id). */
  getActual(): Observable<ApiResponse<EmpresaModel>> {
    return this.http.get<ApiResponse<EmpresaModel>>(`${this.base}/actual`);
  }
  update(dto: UpdateEmpresaDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
}
