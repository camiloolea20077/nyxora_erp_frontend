import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ResponseModel } from '../../shared/utils/responde.models';
import { LoginRequest, RefreshRequest, TokenResponse } from '../models/auth.model';
import { IndexDbService } from './index-db.service';

/** Autenticación + estado de sesión (signals). La fuente persistente es IndexedDB. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly db = inject(IndexDbService);
  private readonly base = `${environment.apiUrl}auth`;

  private readonly _session = signal<TokenResponse | null>(null);
  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => !!this._session()?.accessToken);
  readonly permisos = computed<string[]>(() => this._session()?.permisos ?? []);

  login(req: LoginRequest): Observable<ResponseModel<TokenResponse>> {
    return this.http.post<ResponseModel<TokenResponse>>(`${this.base}/login`, req);
  }

  refresh(req: RefreshRequest): Observable<ResponseModel<TokenResponse>> {
    return this.http.post<ResponseModel<TokenResponse>>(`${this.base}/refresh`, req);
  }

  /** Persiste la sesión (IndexedDB) y la publica en el signal. */
  async persist(session: TokenResponse): Promise<void> {
    await this.db.saveSession(session);
    this._session.set(session);
  }

  /** Rehidrata el signal desde IndexedDB (al arrancar la app). */
  async hydrate(): Promise<void> {
    this._session.set(await this.db.loadSession());
  }

  async logout(): Promise<void> {
    await this.db.clear();
    this._session.set(null);
  }

  hasPermiso(codigo: string): boolean {
    return this.permisos().includes(codigo);
  }
}
