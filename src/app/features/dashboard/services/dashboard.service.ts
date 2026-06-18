import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, PageResponse } from '../../../shared/models/api.model';

/** Servicio del dashboard: obtiene conteos (total) reutilizando los endpoints /list existentes. */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  /** total de registros de un recurso vía POST {recurso}/list con rows=1 (payload mínimo). */
  total(resource: string): Observable<ApiResponse<PageResponse<unknown>>> {
    return this.http.post<ApiResponse<PageResponse<unknown>>>(`${this.base}${resource}/list`, {
      page: 0,
      rows: 1,
    });
  }
}
