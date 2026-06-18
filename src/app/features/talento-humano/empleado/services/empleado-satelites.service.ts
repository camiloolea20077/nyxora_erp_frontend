import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../shared/models/api.model';
import {
  EstudioCreate,
  EstudioModel,
  EstudioUpdate,
  FamiliarCreate,
  FamiliarModel,
  FamiliarUpdate,
  HistoriaLaboralCreate,
  HistoriaLaboralModel,
  HistoriaLaboralUpdate,
} from '../models/talento-humano.model';

/** Satélites de la hoja de vida del empleado: /api/empleados/{empleadoId}/... */
@Injectable({ providedIn: 'root' })
export class EmpleadoSatelitesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}empleados`;

  // Estudios
  listEstudios(eid: number): Observable<ApiResponse<EstudioModel[]>> {
    return this.http.get<ApiResponse<EstudioModel[]>>(`${this.base}/${eid}/estudios`);
  }
  createEstudio(eid: number, dto: EstudioCreate): Observable<ApiResponse<EstudioModel>> {
    return this.http.post<ApiResponse<EstudioModel>>(`${this.base}/${eid}/estudios`, dto);
  }
  updateEstudio(eid: number, dto: EstudioUpdate): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.base}/${eid}/estudios`, dto);
  }
  deleteEstudio(eid: number, id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${eid}/estudios/${id}`);
  }

  // Familiares
  listFamiliares(eid: number): Observable<ApiResponse<FamiliarModel[]>> {
    return this.http.get<ApiResponse<FamiliarModel[]>>(`${this.base}/${eid}/familiares`);
  }
  createFamiliar(eid: number, dto: FamiliarCreate): Observable<ApiResponse<FamiliarModel>> {
    return this.http.post<ApiResponse<FamiliarModel>>(`${this.base}/${eid}/familiares`, dto);
  }
  updateFamiliar(eid: number, dto: FamiliarUpdate): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.base}/${eid}/familiares`, dto);
  }
  deleteFamiliar(eid: number, id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${eid}/familiares/${id}`);
  }

  // Historia laboral
  listHistorias(eid: number): Observable<ApiResponse<HistoriaLaboralModel[]>> {
    return this.http.get<ApiResponse<HistoriaLaboralModel[]>>(`${this.base}/${eid}/historias-laborales`);
  }
  createHistoria(eid: number, dto: HistoriaLaboralCreate): Observable<ApiResponse<HistoriaLaboralModel>> {
    return this.http.post<ApiResponse<HistoriaLaboralModel>>(`${this.base}/${eid}/historias-laborales`, dto);
  }
  updateHistoria(eid: number, dto: HistoriaLaboralUpdate): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.base}/${eid}/historias-laborales`, dto);
  }
  deleteHistoria(eid: number, id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${eid}/historias-laborales/${id}`);
  }
}
