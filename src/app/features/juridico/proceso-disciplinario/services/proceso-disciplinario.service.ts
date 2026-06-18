import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import {
  AddProcesoFaltaDto,
  CambiarEstadoProcesoDto,
  CreateProcesoDescargoDto,
  CreateProcesoDisciplinarioDto,
  CreateProcesoNotificacionDto,
  ProcesoDescargo,
  ProcesoDisciplinarioModel,
  ProcesoDisciplinarioTableModel,
  ProcesoFalta,
  ProcesoNotificacion,
  UpdateProcesoDisciplinarioDto,
} from '../models/proceso-disciplinario.model';

@Injectable({ providedIn: 'root' })
export class ProcesoDisciplinarioService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}procesos-disciplinarios`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<ProcesoDisciplinarioTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ProcesoDisciplinarioTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ProcesoDisciplinarioModel>> {
    return this.http.get<ApiResponse<ProcesoDisciplinarioModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateProcesoDisciplinarioDto): Observable<ApiResponse<ProcesoDisciplinarioModel>> {
    return this.http.post<ApiResponse<ProcesoDisciplinarioModel>>(this.base, dto);
  }
  update(dto: UpdateProcesoDisciplinarioDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
  cambiarEstado(id: number, dto: CambiarEstadoProcesoDto): Observable<ApiResponse<ProcesoDisciplinarioModel>> {
    return this.http.post<ApiResponse<ProcesoDisciplinarioModel>>(`${this.base}/${id}/estado`, dto);
  }

  // Faltas
  listFaltas(id: number): Observable<ApiResponse<ProcesoFalta[]>> {
    return this.http.get<ApiResponse<ProcesoFalta[]>>(`${this.base}/${id}/faltas`);
  }
  addFalta(id: number, dto: AddProcesoFaltaDto): Observable<ApiResponse<ProcesoFalta>> {
    return this.http.post<ApiResponse<ProcesoFalta>>(`${this.base}/${id}/faltas`, dto);
  }
  removeFalta(id: number, faltaLinkId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}/faltas/${faltaLinkId}`);
  }

  // Descargos
  listDescargos(id: number): Observable<ApiResponse<ProcesoDescargo[]>> {
    return this.http.get<ApiResponse<ProcesoDescargo[]>>(`${this.base}/${id}/descargos`);
  }
  addDescargo(id: number, dto: CreateProcesoDescargoDto): Observable<ApiResponse<ProcesoDescargo>> {
    return this.http.post<ApiResponse<ProcesoDescargo>>(`${this.base}/${id}/descargos`, dto);
  }
  removeDescargo(id: number, descargoId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}/descargos/${descargoId}`);
  }

  // Notificaciones
  listNotificaciones(id: number): Observable<ApiResponse<ProcesoNotificacion[]>> {
    return this.http.get<ApiResponse<ProcesoNotificacion[]>>(`${this.base}/${id}/notificaciones`);
  }
  addNotificacion(id: number, dto: CreateProcesoNotificacionDto): Observable<ApiResponse<ProcesoNotificacion>> {
    return this.http.post<ApiResponse<ProcesoNotificacion>>(`${this.base}/${id}/notificaciones`, dto);
  }
  removeNotificacion(id: number, notifId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}/notificaciones/${notifId}`);
  }
}
