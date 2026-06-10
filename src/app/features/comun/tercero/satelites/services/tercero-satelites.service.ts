import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../../environments/environment';
import { ApiResponse } from '../../../../../shared/models/api.model';
import {
  ContactoCreate,
  ContactoModel,
  ContactoUpdate,
  CuentaCreate,
  CuentaModel,
  CuentaUpdate,
  DireccionCreate,
  DireccionModel,
  DireccionUpdate,
} from '../models/tercero-satelite.model';

@Injectable({ providedIn: 'root' })
export class TerceroSatelitesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}terceros`;

  // Contactos
  listContactos(tid: number): Observable<ApiResponse<ContactoModel[]>> {
    return this.http.get<ApiResponse<ContactoModel[]>>(`${this.base}/${tid}/contactos`);
  }
  createContacto(tid: number, dto: ContactoCreate): Observable<ApiResponse<ContactoModel>> {
    return this.http.post<ApiResponse<ContactoModel>>(`${this.base}/${tid}/contactos`, dto);
  }
  updateContacto(tid: number, dto: ContactoUpdate): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.base}/${tid}/contactos`, dto);
  }
  deleteContacto(tid: number, id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${tid}/contactos/${id}`);
  }

  // Direcciones
  listDirecciones(tid: number): Observable<ApiResponse<DireccionModel[]>> {
    return this.http.get<ApiResponse<DireccionModel[]>>(`${this.base}/${tid}/direcciones`);
  }
  createDireccion(tid: number, dto: DireccionCreate): Observable<ApiResponse<DireccionModel>> {
    return this.http.post<ApiResponse<DireccionModel>>(`${this.base}/${tid}/direcciones`, dto);
  }
  updateDireccion(tid: number, dto: DireccionUpdate): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.base}/${tid}/direcciones`, dto);
  }
  deleteDireccion(tid: number, id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${tid}/direcciones/${id}`);
  }

  // Cuentas bancarias
  listCuentas(tid: number): Observable<ApiResponse<CuentaModel[]>> {
    return this.http.get<ApiResponse<CuentaModel[]>>(`${this.base}/${tid}/cuentas-bancarias`);
  }
  createCuenta(tid: number, dto: CuentaCreate): Observable<ApiResponse<CuentaModel>> {
    return this.http.post<ApiResponse<CuentaModel>>(`${this.base}/${tid}/cuentas-bancarias`, dto);
  }
  updateCuenta(tid: number, dto: CuentaUpdate): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.base}/${tid}/cuentas-bancarias`, dto);
  }
  deleteCuenta(tid: number, id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${tid}/cuentas-bancarias/${id}`);
  }
}
