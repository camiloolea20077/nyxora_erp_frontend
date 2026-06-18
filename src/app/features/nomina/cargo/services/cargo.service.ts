import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ApiResponse, PageResponse, Pageable } from '../../../../shared/models/api.model';
import { CargoModel, CargoTableModel, CreateCargoDto, UpdateCargoDto } from '../models/cargo.model';

@Injectable({ providedIn: 'root' })
export class CargoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}cargos`;

  list(req: Pageable): Observable<ApiResponse<PageResponse<CargoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<CargoTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<CargoModel>> {
    return this.http.get<ApiResponse<CargoModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateCargoDto): Observable<ApiResponse<CargoModel>> {
    return this.http.post<ApiResponse<CargoModel>>(this.base, dto);
  }
  update(dto: UpdateCargoDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
