import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../shared/models/api.model';
import { PacPresupuestalModel, PacUpsertDto } from '../models/pac.model';

@Injectable({ providedIn: 'root' })
export class PacService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}pac-presupuestal`;

  list(rubroId: number, anio: number): Observable<ApiResponse<PacPresupuestalModel[]>> {
    const params = new HttpParams().set('rubroId', String(rubroId)).set('anio', String(anio));
    return this.http.get<ApiResponse<PacPresupuestalModel[]>>(this.base, { params });
  }
  upsert(dto: PacUpsertDto): Observable<ApiResponse<PacPresupuestalModel>> {
    return this.http.post<ApiResponse<PacPresupuestalModel>>(this.base, dto);
  }
}
