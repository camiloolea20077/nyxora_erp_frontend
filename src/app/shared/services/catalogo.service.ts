import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../models/api.model';
import { CatalogoCrud, CatalogoItem, UbicacionMunicipio } from '../models/catalogo.model';

/** Búsqueda y CRUD genérico de catálogos: /api/catalogos/{slug}. */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}catalogos`;

  list(
    catalogo: string,
    req: Pageable,
    parentId?: number | null,
    soloActivos = true,
  ): Observable<ApiResponse<PageResponse<CatalogoItem>>> {
    let params = new HttpParams();
    if (parentId != null) {
      params = params.set('parentId', String(parentId));
    }
    if (!soloActivos) {
      params = params.set('soloActivos', 'false');
    }
    return this.http.post<ApiResponse<PageResponse<CatalogoItem>>>(`${this.base}/${catalogo}/list`, req, {
      params,
    });
  }

  byId(catalogo: string, id: number): Observable<ApiResponse<CatalogoItem>> {
    return this.http.get<ApiResponse<CatalogoItem>>(`${this.base}/${catalogo}/${id}`);
  }

  create(catalogo: string, dto: CatalogoCrud): Observable<ApiResponse<CatalogoItem>> {
    return this.http.post<ApiResponse<CatalogoItem>>(`${this.base}/${catalogo}`, dto);
  }

  update(catalogo: string, dto: CatalogoCrud): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.base}/${catalogo}`, dto);
  }

  delete(catalogo: string, id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${catalogo}/${id}`);
  }

  ubicacionMunicipio(id: number): Observable<ApiResponse<UbicacionMunicipio>> {
    return this.http.get<ApiResponse<UbicacionMunicipio>>(`${this.base}/municipio/${id}/ubicacion`);
  }
}
