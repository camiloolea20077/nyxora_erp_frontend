import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../shared/models/api.model';
import { PermisoModel } from '../models/permiso.model';

@Injectable({ providedIn: 'root' })
export class PermisoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}permisos`;

  /** Lista completa (catálogo global, sin paginar) para tablas y multiselects de roles. */
  getAll(): Observable<ApiResponse<PermisoModel[]>> {
    return this.http.get<ApiResponse<PermisoModel[]>>(this.base);
  }
}
